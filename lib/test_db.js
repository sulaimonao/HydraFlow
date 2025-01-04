// lib/test_db.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Testing Supabase workflow features...");

async function testDatabaseFeatures() {
  try {
    const testUserId = "user_123";
    const testChatroomId = "chatroom_456";
    const responseId = `response_${Date.now()}`;

    // 1. Insert a test feedback entry
    console.log("\nInserting Feedback Entry...");
    const feedbackInsert = await supabase.from("feedback_entries").insert([
      {
        response_id: responseId,
        user_feedback: "Great workflow!",
        rating: 5,
        timestamp: new Date().toISOString(),
      },
    ]);
    if (feedbackInsert.error) {
      console.error("Error inserting feedback:", feedbackInsert.error.message);
    } else {
      console.log("Feedback Insert Result:", feedbackInsert.data);
    }

    // 2. Fetch feedback entries
    console.log("\nFetching Feedback Entries...");
    const feedbackFetch = await supabase
      .from("feedback_entries")
      .select("*")
      .limit(5);
    if (feedbackFetch.error) {
      console.error("Error fetching feedback entries:", feedbackFetch.error.message);
    } else {
      console.log("Feedback Entries (sample):", feedbackFetch.data);
    }

    // 3. Insert a test task card
    console.log("\nInserting Task Card...");
    const taskInsert = await supabase.from("task_cards").insert([
      {
        goal: "Test Task for Workflow",
        priority: "High",
        user_id: testUserId,
        chatroom_id: testChatroomId,
        created_at: new Date().toISOString(),
        active: true,
      },
    ]);
    if (taskInsert.error) {
      console.error("Error inserting task card:", taskInsert.error.message);
    } else {
      console.log("Task Card Insert Result:", taskInsert.data);
    }

    // 4. Fetch task cards
    console.log("\nFetching Task Cards...");
    const taskFetch = await supabase
      .from("task_cards")
      .select("*")
      .limit(5);
    if (taskFetch.error) {
      console.error("Error fetching task cards:", taskFetch.error.message);
    } else {
      console.log("Task Cards (sample):", taskFetch.data);
    }

    // 5. Insert subtasks for the task card
    if (taskInsert.data && taskInsert.data[0]) {
      const taskCardId = taskInsert.data[0].id;
      console.log("\nInserting Subtasks...");
      const subtasksInsert = await supabase.from("subtasks").insert([
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
      ]);
      if (subtasksInsert.error) {
        console.error("Error inserting subtasks:", subtasksInsert.error.message);
      } else {
        console.log("Subtasks Insert Result:", subtasksInsert.data);
      }

      // 6. Fetch subtasks
      console.log("\nFetching Subtasks...");
      const subtasksFetch = await supabase
        .from("subtasks")
        .select("*")
        .eq("task_card_id", taskCardId);
      if (subtasksFetch.error) {
        console.error("Error fetching subtasks:", subtasksFetch.error.message);
      } else {
        console.log("Subtasks (sample):", subtasksFetch.data);
      }
    }

    // 7. Insert a memory entry
    console.log("\nInserting Memory...");
    const memoryInsert = await supabase.from("memories").insert([
      {
        user_id: testUserId,
        chatroom_id: testChatroomId,
        memory: "Sample memory for workflow testing.",
        updated_at: new Date().toISOString(),
      },
    ]);
    if (memoryInsert.error) {
      console.error("Error inserting memory:", memoryInsert.error.message);
    } else {
      console.log("Memory Insert Result:", memoryInsert.data);
    }

    // 8. Fetch memories
    console.log("\nFetching Memories...");
    const memoriesFetch = await supabase
      .from("memories")
      .select("*")
      .limit(5);
    if (memoriesFetch.error) {
      console.error("Error fetching memories:", memoriesFetch.error.message);
    } else {
      console.log("Memories (sample):", memoriesFetch.data);
    }

    // 9. Insert a head entry
    console.log("\nInserting Head...");
    const headInsert = await supabase.from("heads").insert([
      {
        name: "Workflow Analyzer",
        status: "active",
        user_id: testUserId,
        chatroom_id: testChatroomId,
        createdat: new Date().toISOString(),
        preferences: { focus: "efficiency" },
      },
    ]);
    if (headInsert.error) {
      console.error("Error inserting head:", headInsert.error.message);
    } else {
      console.log("Head Insert Result:", headInsert.data);
    }

    // 10. Fetch heads
    console.log("\nFetching Heads...");
    const headsFetch = await supabase
      .from("heads")
      .select("*")
      .limit(5);
    if (headsFetch.error) {
      console.error("Error fetching heads:", headsFetch.error.message);
    } else {
      console.log("Heads (sample):", headsFetch.data);
    }

    // 11. Insert a context entry
    console.log("\nInserting Context...");
    const contextInsert = await supabase.from("contexts").insert([
      {
        user_id: testUserId,
        chatroom_id: testChatroomId,
        data: { goal: "Optimize workflow", status: "in-progress" },
        updated_at: new Date().toISOString(),
      },
    ]);
    if (contextInsert.error) {
      console.error("Error inserting context:", contextInsert.error.message);
    } else {
      console.log("Context Insert Result:", contextInsert.data);
    }

    // 12. Fetch contexts
    console.log("\nFetching Contexts...");
    const contextsFetch = await supabase
      .from("contexts")
      .select("*")
      .limit(5);
    if (contextsFetch.error) {
      console.error("Error fetching contexts:", contextsFetch.error.message);
    } else {
      console.log("Contexts (sample):", contextsFetch.data);
    }

    console.log("\nDatabase workflow test completed successfully.");
  } catch (error) {
    console.error("Error testing database workflow features:", error.message);
  }
}

// Run the test
testDatabaseFeatures();
