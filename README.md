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

### Basic Usage

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
- **`questionGeneratorAgent`**: Mastra agent specialized in generating educational questions
- **`simpleOCR`**: Pure JavaScript PDF text extraction (no system dependencies)

### Workflow Steps

1. **`download-pdf`**: Downloads PDF from provided URL
2. **`extract-text`**: Extracts text using JavaScript PDF parser (`pdf2json`)
3. **`generate-questions`**: Creates comprehensive questions using the question generator agent

## Features

- ✅ **Zero System Dependencies**: Pure JavaScript solution
- ✅ **Simple Setup**: Only requires OpenAI API key
- ✅ **Fast Text Extraction**: Direct PDF parsing (no OCR needed for text-based PDFs)
- ✅ **Single Path**: No complex fallbacks - simple and reliable
- ✅ **Educational Focus**: Generates comprehensive learning questions

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

You can customize the question generation by modifying the `questionGeneratorAgent`:

```typescript
export const questionGeneratorAgent = new Agent({
  name: 'Question Generator Pro',
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
│   └── questionGeneratorAgent.ts    # Question generation agent
├── tools/
│   └── simpleOCR.ts                 # Pure JavaScript PDF parser
├── workflows/
│   └── pdfToQuestionsWorkflow.ts    # Main workflow
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

- Verify the PDF URL is accessible
- Check network connectivity
- Ensure the URL points to a valid PDF file

### "No text could be extracted"

- The PDF might be password-protected
- Very large PDFs might take longer to process
- Scanned PDFs without embedded text won't work (rare with modern PDFs)

## What Makes This Template Special

### 🎯 **True Simplicity**

- Single dependency for PDF processing (`pdf2json`)
- No system tools or complex setup required
- Works immediately after `pnpm install`
- Single straightforward workflow path

### ⚡ **Performance**

- Direct text extraction (no image conversion)
- Much faster than OCR-based approaches
- Handles large documents efficiently

### 🔧 **Developer-Friendly**

- Pure JavaScript/TypeScript
- Easy to understand and modify
- Clear separation of concerns
- No complex branching or fallback logic

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
