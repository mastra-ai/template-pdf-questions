import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { RuntimeContext } from "@mastra/core/di";
import { pdfFetcherTool } from '../tools/pdf-fetcher-tool';
import { textExtractorTool } from '../tools/text-extractor-tool';
import { questionGeneratorTool } from '../tools/question-generator-tool';

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
  execute: async ({ inputData, mastra, runtimeContext }) => {
    console.log('Executing Step: download-pdf');
    const { pdfUrl } = inputData;

    const result = await pdfFetcherTool.execute({
      context: { pdfUrl },
      mastra,
      runtimeContext: runtimeContext || new RuntimeContext(),
    });

    console.log(
      `Step download-pdf: Succeeded - Downloaded ${result.fileSize} bytes`
    );
    return { pdfFile: result.pdfBuffer };
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
  execute: async ({ inputData, mastra, runtimeContext }) => {
    console.log('Executing Step: extract-text', {inputData});
    const { pdfFile } = inputData;

    if (!pdfFile || !(pdfFile instanceof Buffer)) {
      throw new Error('Invalid PDF file provided');
    }

    const result = await textExtractorTool.execute({
      context: { pdfBuffer: pdfFile },
      mastra,
      runtimeContext: runtimeContext || new RuntimeContext(),
    });

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
  execute: async ({ inputData, mastra, runtimeContext }) => {
    console.log('Executing Step: generate-questions');

    const { extractedText } = inputData;

    if (!extractedText) {
      console.error('Missing extracted text in question generation step');
      return { questions: [], success: false };
    }

    try {
      const result = await questionGeneratorTool.execute({
        context: { extractedText },
        mastra,
        runtimeContext: runtimeContext || new RuntimeContext(),
      });

      console.log(
        `Step generate-questions: Succeeded - Generated ${result.questions.length} questions`
      );
      return { questions: result.questions, success: result.success };
    } catch (error) {
      console.error(
        'Step generate-questions: Failed - Error during generation:',
        error
      );
      return { questions: [], success: false };
    }
  },
});

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
