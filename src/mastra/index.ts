import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { pdfToQuestionsWorkflow } from './workflows/pdfToQuestionsWorkflow';
import { questionGeneratorAgent } from './agents/questionGeneratorAgent';
import { pdfQuestionsAgent } from './agents/pdf-questions-agent';

export const mastra = new Mastra({
  workflows: { pdfToQuestionsWorkflow },
  agents: {
    questionGeneratorAgent,
    pdfQuestionsAgent,
  },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
