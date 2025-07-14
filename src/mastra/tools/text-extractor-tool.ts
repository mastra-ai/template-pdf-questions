import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { extractTextFromPDFSimple } from './simpleOCR';

export const textExtractorTool = createTool({
  id: 'text-extractor',
  description: 'Extracts text from a PDF buffer using OCR',
  inputSchema: z.object({
    pdfBuffer: z.instanceof(Buffer).describe('The PDF file buffer to process'),
  }),
  outputSchema: z.object({
    extractedText: z.string().describe('The text extracted from the PDF'),
    pagesCount: z.number().describe('Number of pages processed'),
    characterCount: z.number().describe('Number of characters extracted'),
  }),
  execute: async ({ context }) => {
    const { pdfBuffer } = context;

    console.log('📄 Extracting text from PDF buffer...');

    if (!pdfBuffer || !(pdfBuffer instanceof Buffer)) {
      throw new Error('Invalid PDF buffer provided');
    }

    try {
      const result = await extractTextFromPDFSimple(pdfBuffer);

      if (!result.extractedText || result.extractedText.trim() === '') {
        throw new Error('No text could be extracted from the provided PDF');
      }

      console.log(`✅ Text extraction successful: ${result.extractedText.length} characters from ${result.pagesCount} pages`);

      return {
        extractedText: result.extractedText,
        pagesCount: result.pagesCount,
        characterCount: result.extractedText.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Text extraction failed:', errorMessage);
      throw new Error(`Text extraction failed: ${errorMessage}`);
    }
  },
});
