import { mastra } from './src/mastra/index';

async function runPdfToQuestionsExample() {
  try {
    console.log('🚀 Starting PDF to Questions workflow...');

    // Example: Using a PDF URL
    const examplePdfUrl = 'https://arxiv.org/pdf/1706.03762.pdf'; // Transformer paper

    const run = await mastra.getWorkflow('pdfToQuestionsWorkflow').createRunAsync();

    const result = await run.start({
      inputData: {
        pdfUrl: examplePdfUrl,
      },
    });

    console.log('📊 Workflow Result:', JSON.stringify(result, null, 2));

    if (result.status === 'success' && result.result?.questions) {
      console.log('\n✅ Generated Questions:');
      result.result.questions.forEach((question: string, index: number) => {
        console.log(`${index + 1}. ${question}`);
      });
    } else {
      console.log('❌ Workflow failed or no questions generated');
    }

  } catch (error) {
    console.error('❌ Error running workflow:', error);
  }
}

// Run the example
console.log('🎯 PDF to Questions Workflow Example\n');

// Make sure to set OPENAI_API_KEY environment variable
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Please set OPENAI_API_KEY environment variable');
  console.error('   Example: export OPENAI_API_KEY="your-api-key-here"');
  process.exit(1);
}

console.log('✅ Using OpenAI GPT-4o for OCR and question generation');
console.log('📄 Process: PDF URL → Download → OCR → Question Generation\n');

runPdfToQuestionsExample()
  .then(() => console.log('\n✅ Example completed'))
  .catch(console.error);
