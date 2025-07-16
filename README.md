# PDF to Questions Generator

A simple Mastra template that processes PDF files and generates comprehensive questions from their content using OpenAI GPT-4o.

## Overview

This template demonstrates a straightforward workflow:

1. **Input**: PDF URL
2. **Download**: Fetch the PDF file
3. **Extract Text**: Parse PDF using pure JavaScript (no system dependencies!)
4. **Generate Questions**: Create questions using OpenAI GPT-4o

## Prerequisites

- Node.js 20.9.0 or higher
- OpenAI API key (that's it!)

## Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd template-pdf-questions
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Run the example:**

   ```bash
   export OPENAI_API_KEY="your-real-api-key-here"
   npx tsx example.ts
   ```

## Usage

### Using the Workflow

```typescript
import { mastra } from './src/mastra/index';

const run = await mastra.getWorkflow('pdfToQuestionsWorkflow').createRunAsync();

// Using a PDF URL
const result = await run.start({
  inputData: {
    pdfUrl: 'https://example.com/document.pdf',
  },
});

console.log(result.result.questions);
```

### Using the PDF Questions Agent

```typescript
import { mastra } from './src/mastra/index';

const agent = mastra.getAgent('pdfQuestionsAgent');

// The agent can handle the full process with natural language
const response = await agent.stream([
  {
    role: 'user',
    content: 'Please download this PDF and generate questions from it: https://example.com/document.pdf',
  },
]);

for await (const chunk of response.textStream) {
  console.log(chunk);
}
```

### Using Individual Tools

```typescript
import { mastra } from './src/mastra/index';
import { pdfFetcherTool } from './src/mastra/tools/download-pdf-tool';
import { extractTextFromPDFTool } from './src/mastra/tools/extract-text-from-pdf-tool';
import { generateQuestionsFromTextTool } from './src/mastra/tools/generate-questions-from-text-tool';

// Step 1: Download PDF
const pdfResult = await pdfFetcherTool.execute({
  context: { pdfUrl: 'https://example.com/document.pdf' },
  runtimeContext: new RuntimeContext(),
});

// Step 2: Extract text
const textResult = await extractTextFromPDFTool.execute({
  context: { pdfBuffer: pdfResult.pdfBuffer },
  runtimeContext: new RuntimeContext(),
});

// Step 3: Generate questions
const questionsResult = await generateQuestionsFromTextTool.execute({
  context: {
    extractedText: textResult.extractedText,
    maxQuestions: 10
  },
  mastra,
  runtimeContext: new RuntimeContext(),
});

console.log(questionsResult.questions);
```

### Expected Output

```javascript
{
  status: 'success',
  result: {
    questions: [
      "What is the main objective of the research presented in this paper?",
      "Which methodology was used to collect the data?",
      "What are the key findings of the study?",
      // ... more questions
    ],
    success: true
  }
}
```

## Architecture

### Components

- **`pdfToQuestionsWorkflow`**: Main workflow orchestrating the process
- **`textQuestionAgent`**: Mastra agent specialized in generating educational questions
- **`pdfQuestionAgent`**: Complete agent that can handle the full PDF to questions pipeline

### Tools

- **`pdfFetcherTool`**: Downloads PDF files from URLs and returns buffers
- **`extractTextFromPDFTool`**: Extracts text from PDF buffers using text parsing
- **`generateQuestionsFromTextTool`**: Generates comprehensive questions from extracted text

### Workflow Steps

1. **`download-pdf`**: Downloads PDF from provided URL
2. **`extract-text`**: Extracts text using JavaScript PDF parser (`pdf2json`)
3. **`generate-questions`**: Creates comprehensive questions using the question generator agent

## Features

- ✅ **Zero System Dependencies**: Pure JavaScript solution
- ✅ **Simple Setup**: Only requires OpenAI API key
- ✅ **Fast Text Extraction**: Direct PDF parsing (no OCR needed for text-based PDFs)
- ✅ **Educational Focus**: Generates comprehensive learning questions
- ✅ **Multiple Interfaces**: Workflow, Agent, and individual tools available

## How It Works

### Text Extraction Strategy

This template uses a **pure JavaScript approach** that works for most PDFs:

1. **Text-based PDFs** (90% of cases): Direct text extraction using `pdf2json`

   - ⚡ Fast and reliable
   - 🔧 No system dependencies
   - ✅ Works out of the box

2. **Scanned PDFs**: Would require OCR, but most PDFs today contain embedded text

### Why This Approach?

- **Simplicity**: No GraphicsMagick, ImageMagick, or other system tools needed
- **Speed**: Direct text extraction is much faster than OCR
- **Reliability**: Works consistently across different environments
- **Educational**: Easy for developers to understand and modify
- **Single Path**: One clear workflow with no complex branching

## Configuration

### Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Customization

You can customize the question generation by modifying the `textQuestionAgent`:

```typescript
export const textQuestionAgent = new Agent({
  name: 'Generate questions from text agent',
  instructions: `
    You are an expert educational content creator...
    // Customize instructions here
  `,
  model: openai('gpt-4o'),
});
```

## Development

### Project Structure

```text
src/mastra/
├── agents/
│   ├── pdf-question-agent.ts       # PDF processing and question generation agent
│   └── text-question-agent.ts      # Text to questions generation agent
├── tools/
│   ├── download-pdf-tool.ts         # PDF download tool
│   ├── extract-text-from-pdf-tool.ts # PDF text extraction tool
│   └── generate-questions-from-text-tool.ts # Question generation tool
├── workflows/
│   └── generate-questions-from-pdf-workflow.ts # Main workflow
├── lib/
│   └── util.ts                      # Utility functions including PDF text extraction
└── index.ts                         # Mastra configuration
```

### Testing

```bash
# Run with a test PDF
export OPENAI_API_KEY="your-api-key"
npx tsx example.ts
```

## Common Issues

### "OPENAI_API_KEY is not set"

- Make sure you've set the environment variable
- Check that your API key is valid and has sufficient credits

### "Failed to download PDF"

- Verify the PDF URL is accessible and publicly available
- Check network connectivity
- Ensure the URL points to a valid PDF file
- Some servers may require authentication or have restrictions

### "No text could be extracted"

- The PDF might be password-protected
- Very large PDFs might take longer to process
- Scanned PDFs without embedded text won't work (rare with modern PDFs)

### "Context length exceeded" or Token Limit Errors

- **Solution**: Use a smaller PDF file (under ~5-10 pages)
- **Automatic Truncation**: The tool automatically uses only the first 4000 characters for very large documents
- **Helpful Errors**: Clear messages guide you to use smaller PDFs when needed

## What Makes This Template Special

### 🎯 **True Simplicity**

- Single dependency for PDF processing (`pdf2json`)
- No system tools or complex setup required
- Works immediately after `pnpm install`
- Multiple usage patterns (workflow, agent, tools)

### ⚡ **Performance**

- Direct text extraction (no image conversion)
- Much faster than OCR-based approaches
- Handles reasonably-sized documents efficiently

### 🔧 **Developer-Friendly**

- Pure JavaScript/TypeScript
- Easy to understand and modify
- Clear separation of concerns
- Simple error handling with helpful messages

### 📚 **Educational Value**

- Generates multiple question types
- Covers different comprehension levels
- Perfect for creating study materials

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
