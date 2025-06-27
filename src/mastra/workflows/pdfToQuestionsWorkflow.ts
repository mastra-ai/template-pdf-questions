import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { extractTextFromPDFSimple } from '../tools/simpleOCR';

// Define schemas for input and outputs
const pdfInputSchema = z.object({
  pdfUrl: z.string().describe('URL to a PDF file to download and process'),
});

const extractedTextSchema = z.object({
  extractedText: z.string().describe('The text extracted from the PDF'),
});

const questionsSchema = z.object({
  questions: z
    .array(z.string())
    .describe('The generated questions from the PDF content'),
  success: z
    .boolean()
    .describe('Indicates if the question generation was successful'),
});

// Step 1: Download PDF from URL if needed
const downloadPdfStep = createStep({
  id: 'download-pdf',
  description: 'Downloads PDF from URL if URL is provided',
  inputSchema: pdfInputSchema,
  outputSchema: z.object({
    pdfFile: z.instanceof(Buffer).describe('The downloaded PDF file buffer'),
  }),
  execute: async ({ inputData }) => {
    console.log('Executing Step: download-pdf');
    const { pdfUrl } = inputData;

    console.log('Downloading PDF from URL:', pdfUrl);
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to download PDF: ${response.status} ${response.statusText}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const downloadedPdfFile = Buffer.from(arrayBuffer);

      console.log(
        `Step download-pdf: Succeeded - Downloaded ${downloadedPdfFile.length} bytes`
      );
      return { pdfFile: downloadedPdfFile };
    } catch (error) {
      throw new Error(
        `Failed to download PDF from URL: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },
});

// Step 2: Extract Text from PDF
const extractTextStep = createStep({
  id: 'extract-text',
  description: 'Extracts text from the provided PDF file using OCR',
  inputSchema: z.object({
    pdfFile: z.instanceof(Buffer).describe('The PDF file buffer to process'),
  }),
  outputSchema: extractedTextSchema,
  execute: async ({ inputData, mastra }) => {
    console.log('Executing Step: extract-text');
    const { pdfFile } = inputData;

    if (!pdfFile || !(pdfFile instanceof Buffer)) {
      throw new Error('Invalid PDF file provided');
    }

    const result = await extractTextFromPDFSimple(pdfFile);
    const extractedText = result.extractedText;

    if (!extractedText || extractedText.trim() === '') {
      console.error('No text could be extracted from the PDF');
      throw new Error('No text could be extracted from the provided PDF');
    }

    console.log(
      `Step extract-text: Succeeded - Extracted ${extractedText.length} characters`
    );

    return { extractedText };
  },
});

// Step 3: Generate Questions from Extracted Text
const generateQuestionsStep = createStep({
  id: 'generate-questions',
  description: 'Generates questions from the extracted PDF text',
  inputSchema: extractedTextSchema,
  outputSchema: questionsSchema,
  execute: async ({ inputData, mastra }) => {
    console.log('Executing Step: generate-questions');

    const { extractedText } = inputData;

    if (!extractedText) {
      console.error('Missing extracted text in question generation step');
      return { questions: [], success: false };
    }

    try {
      const agent = mastra?.getAgent('questionGeneratorAgent');
      if (!agent) {
        throw new Error('Question generator agent not found');
      }

      const streamResponse = await agent.stream([
        {
          role: 'user',
          content: `Generate comprehensive questions based on the following content extracted from a PDF.
Please create questions that test understanding, analysis, and application of the content:

${extractedText.substring(0, 4000)}`,
        },
      ]);

      let generatedContent = '';

      for await (const chunk of streamResponse.textStream) {
        generatedContent += chunk || '';
      }

      if (generatedContent.trim().length > 20) {
        // Parse the questions from the generated content
        const questions = parseQuestionsFromText(generatedContent);

        console.log(
          `Step generate-questions: Succeeded - Generated ${questions.length} questions`
        );
        return { questions, success: true };
      } else {
        console.warn(
          'Step generate-questions: Failed - Generated content too short'
        );
        return { questions: [], success: false };
      }
    } catch (error) {
      console.error(
        'Step generate-questions: Failed - Error during generation:',
        error
      );
      return { questions: [], success: false };
    }
  },
});

// Removed fallback step - keeping it simple with single question generation path

// Helper function to parse questions from generated text
function parseQuestionsFromText(text: string): string[] {
  // Split by common question patterns and clean up
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => line.includes('?') || line.match(/^\d+[\.\)]/)); // Question marks or numbered items

  // Extract actual questions
  const questions = lines
    .map((line) => {
      // Remove numbering patterns like "1.", "1)", etc.
      let cleaned = line.replace(/^\d+[\.\)]\s*/, '');
      // Remove bullet points
      cleaned = cleaned.replace(/^[\-\*\•]\s*/, '');
      return cleaned.trim();
    })
    .filter((q) => q.length > 5) // Filter out very short strings
    .slice(0, 10); // Limit to 10 questions

  return questions;
}

// Define the workflow with simple sequential steps
export const pdfToQuestionsWorkflow = createWorkflow({
  id: 'pdf-to-questions',
  description:
    'Downloads PDF from URL, extracts text, and generates questions from the content',
  inputSchema: pdfInputSchema,
  outputSchema: questionsSchema,
})
  .then(downloadPdfStep)
  .then(extractTextStep)
  .then(generateQuestionsStep)
  .commit();
