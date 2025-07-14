import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const pdfFetcherTool = createTool({
  id: 'pdf-fetcher',
  description: 'Downloads a PDF from a URL and returns the file buffer',
  inputSchema: z.object({
    pdfUrl: z.string().describe('URL to the PDF file to download'),
  }),
  outputSchema: z.object({
    pdfBuffer: z.instanceof(Buffer).describe('The downloaded PDF file buffer'),
    fileSize: z.number().describe('Size of the downloaded file in bytes'),
  }),
      execute: async ({ context }) => {
    const { pdfUrl } = context;

    console.log('📥 Downloading PDF from URL:', pdfUrl);

    try {
      const response = await fetch(pdfUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to download PDF: ${response.status} ${response.statusText}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);

      console.log(`✅ Downloaded PDF: ${pdfBuffer.length} bytes`);

      return {
        pdfBuffer,
        fileSize: pdfBuffer.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ PDF download failed:', errorMessage);
      throw new Error(`Failed to download PDF from URL: ${errorMessage}`);
    }
  },
});
