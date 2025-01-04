function parseQuery(query) {
  const keywords = query.split(" ").filter(word => word.length > 2);
  const actionItems = [];

  if (query.includes("summarize logs")) actionItems.push("summarize logs");
  if (query.includes("create head")) actionItems.push("create head");

  return { keywords, actionItems };
}

export { parseQuery };
