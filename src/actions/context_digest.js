// src/actions/context_digest.js
/**
 * Generates a digest of the given memory.
 */
export const generateContextDigest = (memory) => {
  if (!memory) return "No memory available to summarize.";

  const digest = {
    totalEntries: memory.length,
    highlights: memory.slice(0, 3), // Include the first 3 entries as highlights
  };

  return digest;
};
