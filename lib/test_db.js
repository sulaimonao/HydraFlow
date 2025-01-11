import supabase, { supabaseRequest } from './supabaseClient.js';

console.log("Testing Supabase workflow features...");

async function testDatabaseFeatures() {
  try {
    const testUserId = "user_123";
    const testChatroomId = "chatroom_456";
    const responseId = `response_${Date.now()}`;

    // 1. Insert a test feedback entry
    console.log("\nInserting Feedback Entry...");
    const feedbackInsert = await supabaseRequest(() => supabase.from("feedback_entries").insert([
        {
          response_id: responseId,
          user_feedback: "Great workflow!",
          rating: 5,
          timestamp: new Date().toISOString(),
        },
      ])
    );
    console.log("Feedback Insert Result:", feedbackInsert);

    // 2. Fetch feedback entries
    console.log("\nFetching Feedback Entries...");
    const feedbackFetch = await supabaseRequest(
      supabase.from("feedback_entries").select("*").limit(5)
    );
    console.log("Feedback Entries (sample):", feedbackFetch);

    // 3. Insert a test task card
    console.log("\nInserting Task Card...");
    const taskInsert = await supabaseRequest(() => supabase.from("task_cards").insert([
        {
          goal: "Test Task for Workflow",
          priority: "High",
          user_id: testUserId,
          chatroom_id: testChatroomId,
          created_at: new Date().toISOString(),
          active: true,
        },
      ])
    );
    console.log("Task Card Insert Result:", taskInsert);

    // 4. Fetch task cards
    console.log("\nFetching Task Cards...");
    const taskFetch = await supabaseRequest(
      supabase.from("task_cards").select("*").limit(5)
    );
    console.log("Task Cards (sample):", taskFetch);

    // 5. Insert subtasks for the task card
    if (taskInsert && taskInsert[0]) {
      const taskCardId = taskInsert[0].id;
      console.log("\nInserting Subtasks...");
      const subtasksInsert = await supabaseRequest(() => supabase.from("subtasks").insert([
          {
            task_card_id: taskCardId,
            description: "Subtask 1 for testing",
            status: "pending",
            created_at: new Date().toISOString(),
          },
          {
            task_card_id: taskCardId,
            description: "Subtask 2 for testing",
            status: "pending",
            created_at: new Date().toISOString(),
          },
        ])
      );
      console.log("Subtasks Insert Result:", subtasksInsert);

      // 6. Fetch subtasks
      console.log("\nFetching Subtasks...");
      const subtasksFetch = await supabaseRequest(
        supabase.from("subtasks").select("*").eq("task_card_id", taskCardId)
      );
      console.log("Subtasks (sample):", subtasksFetch);
    }

    // 7. Insert a memory entry
    console.log("\nInserting Memory...");
    const memoryInsert = await supabaseRequest(() => supabase.from("memories").insert([
        {
          user_id: testUserId,
          chatroom_id: testChatroomId,
          memory: "Sample memory for workflow testing.",
          updated_at: new Date().toISOString(),
        },
      ])
    );
    console.log("Memory Insert Result:", memoryInsert);

    // 8. Fetch memories
    console.log("\nFetching Memories...");
    const memoriesFetch = await supabaseRequest(
      supabase.from("memories").select("*").limit(5)
    );
    console.log("Memories (sample):", memoriesFetch);

    // 9. Insert a head entry
    console.log("\nInserting Head...");
    const headInsert = await supabaseRequest(() => supabase.from("heads").insert([
        {
          name: "Workflow Analyzer",
          status: "active",
          user_id: testUserId,
          chatroom_id: testChatroomId,
          createdat: new Date().toISOString(),
          preferences: { focus: "efficiency" },
        },
      ])
    );
    console.log("Head Insert Result:", headInsert);

    // 10. Fetch heads
    console.log("\nFetching Heads...");
    const headsFetch = await supabaseRequest(
      supabase.from("heads").select("*").limit(5)
    );
    console.log("Heads (sample):", headsFetch);

    // 11. Insert a context entry
    console.log("\nInserting Context...");
    const contextInsert = await supabaseRequest(() => supabase.from("contexts").insert([
        {
          user_id: testUserId,
          chatroom_id: testChatroomId,
          data: { goal: "Optimize workflow", status: "in-progress" },
          updated_at: new Date().toISOString(),
        },
      ])
    );
    console.log("Context Insert Result:", contextInsert);

    // 12. Fetch contexts
    console.log("\nFetching Contexts...");
    const contextsFetch = await supabaseRequest(
      supabase.from("contexts").select("*").limit(5)
    );
    console.log("Contexts (sample):", contextsFetch);

    console.log("\nDatabase workflow test completed successfully.");
  } catch (error) {
    console.error("Error testing database workflow features:", error.message);
  }
}

// Run the test
testDatabaseFeatures();
