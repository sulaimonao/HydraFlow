import { parseQuery } from '../actions/query_parser.js';
import { createSubPersona } from '../actions/subpersona_creator.js';
import { summarizeLogs } from '../actions/logs_summarizer.js';
import { compressMemory } from '../actions/memory_compressor.js';
import { contextRecap } from '../actions/context_recapper.js';
import { shouldCreateHead, shouldSummarizeLogs, shouldCompress, needsContextRecap, INITIAL_COMPRESSION_THRESHOLD } from './conditions.js';
import { getConversationLength, getFullHistory, getCompressedMemory, setCompressedMemory } from '../state/memory_state.js';
import { addHead } from '../state/heads_state.js';
import { getContextState } from '../state/context_state.js';
import { generateFinalResponse } from './response_generator.js';

export async function processUserInput(userInput) {
  const conversationLength = getConversationLength();
  const fullHistory = getFullHistory();
  let compressedMemory = getCompressedMemory();

  // Compress at initialization if conversation is already long and not compressed yet
  if (conversationLength > INITIAL_COMPRESSION_THRESHOLD && !compressedMemory) {
    const cmResult = await compressMemory(fullHistory);
    compressedMemory = cmResult.compressedMemory;
    setCompressedMemory(compressedMemory);
  }

  // Parse the user input to find action items
  const parsed = await parseQuery(userInput);
  const actionItems = parsed.actionItems || [];
  const context = getContextState();
  let summaryReport = "";

  // If user wants a head, dynamically create it based on context and parsed query
  if (shouldCreateHead(actionItems)) {
    const task = "Custom task derived from user intent"; // Extract more specifics from parsed key words
    const description = `A specialized sub-persona for ${context.domain}, created to handle: ${parsed.keywords.join(', ')}. Adjust as needed.`;
    const headResult = await createSubPersona(task, description);
    addHead(headResult.subPersonaName, headResult.status);
  }

  // If user wants logs summarized
  if (shouldSummarizeLogs(actionItems)) {
    const logs = await fetchRelevantLogs(); // You define how to get logs
    const sumResult = await summarizeLogs(logs);
    summaryReport = sumResult.summaryReport;
  }

  // Compress memory if needed
  if (shouldCompress(actionItems, conversationLength)) {
    const cmResult = await compressMemory(fullHistory);
    compressedMemory = cmResult.compressedMemory;
    setCompressedMemory(compressedMemory);
  }

  // Optional: recap if needed
  if (needsContextRecap()) {
    const recapResult = await contextRecap(fullHistory, compressedMemory);
    // Incorporate recap into final response generation if desired
  }

  // Generate final response considering updated state
  const response = await generateFinalResponse({
    userInput,
    compressedMemory,
    summaryReport,
    context
  });

  return response;
}
