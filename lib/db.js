// lib/db.js (SQLite version - Corrected with import)
import sqlite3 from 'sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Keep uuid import
import { getDirname } from '../config.js'; // Import the FUNCTION
const __dirname = await getDirname(); // Call the function to get the actual dir

// Database file path (store it in a 'data' directory)
const dbPath = path.resolve(__dirname, 'data/hydraflow.db'); // Corrected path

// Connect to the database (using .verbose() for better error messages)
const sqlite3_v = sqlite3.verbose()
const db = new sqlite3_v.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        throw err; // Critical error, stop the application
    }
    console.log('Connected to the SQLite database.');
    // Create tables if they don't exist
    createTables();
});

// Function to create tables
function createTables() {
    // Task Cards Table
    db.run(`CREATE TABLE IF NOT EXISTS task_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        chatroom_id TEXT NOT NULL,
        goal TEXT,
        priority TEXT DEFAULT 'High',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (err) { console.error('Error creating task_cards table', err); } });

    // Subtasks Table
    db.run(`CREATE TABLE IF NOT EXISTS subtasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_card_id INTEGER NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        user_id TEXT NOT NULL,
        chatroom_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_card_id) REFERENCES task_cards(id) ON DELETE CASCADE
    )`, (err) => { if (err) { console.error('Error creating subtasks table', err); } });

    // Task Dependencies Table
    db.run(`CREATE TABLE IF NOT EXISTS task_dependencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_subtask_id INTEGER NOT NULL,
        parent_subtask_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        chatroom_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (child_subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE
    )`, (err) => { if (err) { console.error('Error creating task_dependencies table', err); } });

    // Feedback Entries Table
    db.run(`CREATE TABLE IF NOT EXISTS feedback_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        response_id TEXT,
        user_feedback TEXT,
        rating INTEGER,
        user_id TEXT NOT NULL,
        chatroom_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (err) { console.error('Error creating feedback_entries table', err); } });

    // Debug Logs Table
    db.run(`CREATE TABLE IF NOT EXISTS debug_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        context_id TEXT NOT NULL,
        issue TEXT,
        resolution TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (err) { console.error('Error creating debug_logs table', err); } });

    // Templates Table (assuming you want to keep this)
    db.run(`CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        chatroom_id TEXT,
        template_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (err) { console.error('Error creating templates table', err); } });

    // Heads Table
    db.run(`CREATE TABLE IF NOT EXISTS heads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        capabilities TEXT,
        preferences TEXT,
        user_id TEXT NOT NULL,
        chatroom_id TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        createdat DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (err) { console.error('Error creating heads table', err); } });

    // Contexts Table
    db.run(`CREATE TABLE IF NOT EXISTS contexts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        chatroom_id TEXT NOT NULL,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (err) { console.error('Error creating contexts table', err); } });

     // API Metrics Table
     db.run(`CREATE TABLE IF NOT EXISTS api_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint TEXT NOT NULL,
        response_time REAL NOT NULL,
        user_id TEXT NOT NULL,
        chatroom_id TEXT NOT NULL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (err) { console.error('Error creating api_metrics table', err); } });

    //Memories table
    db.run(`CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    chatroom_id TEXT NOT NULL,
    memory TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => { if (err) { console.error('Error creating memories table', err); } });
}

// --- Helper Functions (using import syntax) ---

function promisifyDbRun(sql, params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) { // Use function() to access 'this'
            if (err) {
                console.error('DB Run Error:', err.message, 'SQL:', sql);
                reject(err);
            } else {
                resolve({ id: this.lastID }); // Return the ID of the new row
            }
        });
    });
}

function promisifyDbAll(sql, params) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('DB All Error:', err.message, 'SQL:', sql);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function promisifyDbGet(sql, params) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('DB Get Error:', err.message, 'SQL:', sql);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}
// --- Task Cards & Subtasks ---

async function insertTaskCard(userId, chatroomId, goal, priority = 'High') {
    const sql = `INSERT INTO task_cards (user_id, chatroom_id, goal, priority) VALUES (?, ?, ?, ?)`;
    return promisifyDbRun(sql, [userId, chatroomId, goal, priority]);
}

async function insertSubtasks(userId, chatroomId, taskCardId, subtasks) {
    const promises = subtasks.map(subtask => {
        const sql = `INSERT INTO subtasks (task_card_id, description, status, user_id, chatroom_id) VALUES (?, ?, ?, ?, ?)`;
        return promisifyDbRun(sql, [taskCardId, subtask.description, subtask.status || 'pending', userId, chatroomId]);
    });
    return Promise.all(promises);
}

async function fetchTaskCards(userId, chatroomId) {
    const sql = `SELECT * FROM task_cards WHERE user_id = ? AND chatroom_id = ?`;
    return promisifyDbAll(sql, [userId, chatroomId]);
}

async function updateSubtaskStatus(userId, chatroomId, subtaskId, status) {
    const sql = `UPDATE subtasks SET status = ? WHERE id = ? AND user_id = ? AND chatroom_id = ?`;
    return promisifyDbRun(sql, [status, subtaskId, userId, chatroomId]);
}

async function fetchSubtasksByTaskCard(userId, chatroomId, taskCardId) {
    const sql = `SELECT * FROM subtasks WHERE task_card_id = ? AND user_id = ? AND chatroom_id = ?`;
    return promisifyDbAll(sql, [taskCardId, userId, chatroomId]);
}

async function insertTaskDependency(userId, chatroomId, subtaskId, dependsOn) {
    const sql = `INSERT INTO task_dependencies (child_subtask_id, parent_subtask_id, user_id, chatroom_id) VALUES (?, ?, ?, ?)`;
    return promisifyDbRun(sql, [subtaskId, dependsOn, userId, chatroomId]);
}
async function deleteTaskCard(userId, chatroomId, taskCardId) {
    const sql = `DELETE FROM task_cards WHERE id = ? AND user_id = ? AND chatroom_id = ?`;
    return promisifyDbRun(sql, [taskCardId, userId, chatroomId]);
}

// --- Feedback, Debug Logs, Templates ---

async function submitFeedback(userId, chatroomId, responseId, userFeedback, rating) {
    const sql = `INSERT INTO feedback_entries (response_id, user_feedback, rating, user_id, chatroom_id) VALUES (?, ?, ?, ?, ?)`;
    return promisifyDbRun(sql, [responseId, userFeedback, rating, userId, chatroomId]);
}

async function fetchFeedback(userId, chatroomId) {
    const sql = `SELECT * FROM feedback_entries WHERE user_id = ? AND chatroom_id = ?`;
    return promisifyDbAll(sql, [userId, chatroomId]);
}

async function logIssue(userId, chatroomId, issue, resolution) {
    const sql = `INSERT INTO debug_logs (user_id, context_id, issue, resolution) VALUES (?, ?, ?, ?)`;
    return promisifyDbRun(sql, [userId, chatroomId, issue, resolution]);
}

async function fetchDebugLogs(userId, chatroomId) {
    const sql = `SELECT * FROM debug_logs WHERE user_id = ? AND context_id = ?`;
    return promisifyDbAll(sql, [userId, chatroomId]);
}

async function fetchTemplates(userId, chatroomId) {
     let sql = 'SELECT * FROM templates';
    let params = [];

    // Adjust SQL query based on whether userId and chatroomId are provided
    if (userId && chatroomId) {
        sql += ' WHERE user_id = ? AND chatroom_id = ?';
        params = [userId, chatroomId];
    } else if (userId) {
        sql += ' WHERE user_id = ?';
        params = [userId];
    } else if (chatroomId) {
        sql += ' WHERE chatroom_id = ?';
        params = [chatroomId];
    }

    return promisifyDbAll(sql, params);
}

// --- Heads ---

async function insertHead(userId, chatroomId, name, capabilities, preferences) {
    const sql = `INSERT INTO heads (name, capabilities, preferences, user_id, chatroom_id) VALUES (?, ?, ?, ?, ?)`;
     // Serialize capabilities and preferences to JSON strings
    const capabilitiesStr = JSON.stringify(capabilities);
    const preferencesStr = JSON.stringify(preferences);
    return promisifyDbRun(sql, [name, capabilitiesStr, preferencesStr, userId, chatroomId]);
}

async function updateHead(userId, chatroomId, headId, updates) {
    // Convert updates to strings if they are objects
    for (const key in updates) {
        if (typeof updates[key] === 'object' && updates[key] !== null) {
            updates[key] = JSON.stringify(updates[key]);
        }
    }
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(headId, userId, chatroomId); // Add the WHERE clause parameters

    const sql = `UPDATE heads SET ${setClause} WHERE id = ? AND user_id = ? AND chatroom_id = ?`;

    return promisifyDbRun(sql, values);

}

async function validateHeadInteraction(userId, chatroomId, headId) {
    const sql = `SELECT * FROM heads WHERE id = ? AND user_id = ? AND chatroom_id = ?`;
    const head = await promisifyDbGet(sql, [headId, userId, chatroomId]);
     if (!head) {
        throw new Error(`Head with ID ${headId} not found for this user/context.`);
    }
    return head; // Return the head, not an array
}

async function getHeads(userId, chatroomId) {
    const sql = `SELECT * FROM heads WHERE user_id = ? AND chatroom_id = ?`;
     const rows = await promisifyDbAll(sql, [userId, chatroomId]);
      return rows.map(row => ({
        ...row,
        capabilities: JSON.parse(row.capabilities), // Parse the JSON strings back into objects
        preferences: JSON.parse(row.preferences)
    }));
}

// --- Context ---
async function insertContext(userId, chatroomId, contextData) {
    const sql = `INSERT INTO contexts (user_id, chatroom_id, data) VALUES (?, ?, ?)`;
    // Serialize contextData to JSON
    const contextDataStr = JSON.stringify(contextData);
    return promisifyDbRun(sql, [userId, chatroomId, contextDataStr]);
}
// Add fetch context function
async function fetchContext(userId, chatroomId){
  try{
      const sql = `SELECT * FROM contexts WHERE user_id = ? AND chatroom_id = ? ORDER BY created_at DESC LIMIT 1`;
      const contextData = await promisifyDbGet(sql, [userId, chatroomId]);

      return contextData ? { data: contextData.data} : null;
  }
  catch(error){
      console.error("Error fetching context: ", error.message);
      throw new Error("Failed to fetch context.");
  }
}

async function updateContext(userId, chatroomId, contextData) {
  // Check if a context entry already exists
  const existingContext = await fetchContext(userId, chatroomId);
   // Serialize contextData to JSON string
  const contextDataString = JSON.stringify(contextData.data);
  if (existingContext) {
      // Update existing context
      const sql = `UPDATE contexts SET data = ? WHERE user_id = ? AND chatroom_id = ?`;
      return promisifyDbRun(sql, [contextDataString, userId, chatroomId]);
  } else {
      // Insert new context.  Note: The insertContext function already handles this,
      // so we technically don't need this branch, but it's here for completeness
      // and in case you change insertContext later.
      const sql = `INSERT INTO contexts (user_id, chatroom_id, data) VALUES (?, ?, ?)`;
       return promisifyDbRun(sql, [userId, chatroomId, contextDataString]);

  }
}

// --- Added function for fetching a task card by ID
async function fetchTaskCardById(taskCardId, userId, chatroomId) {
  const sql = `SELECT * FROM task_cards WHERE id = ? AND user_id = ? AND chatroom_id = ?`;
  return promisifyDbGet(sql, [taskCardId, userId, chatroomId]);
}

// --- Added function for fetching task dependencies
async function fetchTaskDependencies(subtaskId, userId, chatroomId) {
  const sql = `SELECT * FROM task_dependencies WHERE child_subtask_id = ? AND user_id = ? AND chatroom_id = ?`;
  return promisifyDbAll(sql, [subtaskId, userId, chatroomId]);
}

async function deleteHead(headId, userId, chatroomId) {
  const sql = `DELETE FROM heads WHERE id = ? AND user_id = ? AND chatroom_id = ?`;
  return promisifyDbRun(sql, [headId, userId, chatroomId]);
}

// --- Added function for fetching feedback by taskID
async function fetchFeedbackByTask(userId, chatroomId, taskId) {
  const sql = `SELECT * FROM feedback_entries WHERE user_id = ? AND chatroom_id = ? AND task_id = ?`; // Assuming you have a task_id column
   return promisifyDbAll(sql, [userId, chatroomId, taskId]);
}

// --- Added function for fetching feedback by headId
async function fetchFeedbackByPersona(userId, chatroomId, personaName) {
  const sql = `SELECT * FROM feedback_entries WHERE user_id = ? AND chatroom_id = ? AND head_id = (SELECT id FROM heads WHERE name = ?);`; // Assuming you have a head_id
  return promisifyDbAll(sql, [userId, chatroomId, personaName])
}

async function insertApiMetric(userId, chatroomId, endpoint, responseTime) {
  const sql = `INSERT INTO api_metrics (user_id, chatroom_id, endpoint, response_time) VALUES (?, ?, ?, ?)`;
  return promisifyDbRun(sql, [userId, chatroomId, endpoint, responseTime]);
}

// --- Added function for fetching existing memory.
async function fetchMemory(userId, chatroomId) {
  const sql = `SELECT * FROM memories WHERE user_id = ? AND chatroom_id = ? ORDER BY created_at DESC LIMIT 1`;
  const memory = await promisifyDbGet(sql, [userId, chatroomId]); // Using promisifyDbGet
  return memory;
}

async function updateMemory(userId, chatroomId, compressedMemory) {
  // Check if a memory entry already exists
  const existingMemory = await fetchMemory(userId, chatroomId);

  if (existingMemory) {
      // Update existing memory
      const sql = `UPDATE memories SET memory = ? WHERE user_id = ? AND chatroom_id = ?`;
      await promisifyDbRun(sql, [compressedMemory, userId, chatroomId]); // Using promisifyDbRun
  } else {
      // Insert new memory
      const sql = `INSERT INTO memories (user_id, chatroom_id, memory) VALUES (?, ?, ?)`;
      await promisifyDbRun(sql, [userId, chatroomId, compressedMemory]); // Using promisifyDbRun
  }
  return true;
}

// Promisified Database Functions (Good Practice for Async Operations)
export function open() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error("DB Open Error:", err.message);
        reject(err);
      } else {
        console.log('Connected to the HydraFlow database.');
        resolve(db);
      }
    });
  });
}

export function run(sql, params = []) {
    return new Promise((resolve, reject) => {
      open().then(db => { // Open the database
        db.run(sql, params, function(err) { // Use 'function' to get 'this'
          if (err) {
            console.error("DB Run Error:", err.message);
            reject(err);
          } else {
            resolve({ lastID: this.lastID, changes: this.changes }); // Access 'this'
          }
          db.close() //close db
        });
      }).catch(reject); // Catch any errors from opening the database
    });
  }

  export function get(sql, params = []) {
    return new Promise((resolve, reject) => {
      open().then(db => { // Open the database
        db.get(sql, params, (err, row) => {
          if (err) {
            console.error("DB Get Error:", err.message);
            reject(err);
          } else {
            resolve(row);
          }
          db.close();
        });
      }).catch(reject); // Catch any errors from opening the database
    });
  }

  export function all(sql, params = []) {
    return new Promise((resolve, reject) => {
      open().then(db => {
        db.all(sql, params, (err, rows) => {
          if (err) {
            console.error("DB All Error:", err.message);
            reject(err);
          } else {
            resolve(rows);
          }
          db.close()
        });
      }).catch(reject);
    });
  }

// Example usage (for testing or initialization):
//  const db = await open(); // Open connection
//  const result = await run('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)'); //creates test table.
//  const allRows = await all('SELECT * FROM test'); //select all
//  db.close()

// --- Exported Functions ---

export {
    insertTaskCard,
    insertSubtasks,
    fetchTaskCards,
    updateSubtaskStatus,
    fetchSubtasksByTaskCard,
    insertTaskDependency,
    deleteTaskCard,
    submitFeedback,
    fetchFeedback,
    logIssue,
    fetchDebugLogs,
    fetchTemplates,
    insertHead,
    updateHead,
    validateHeadInteraction,
    getHeads,
    insertContext,
    fetchContext,
    updateContext,
    fetchTaskCardById,
    fetchTaskDependencies,
    deleteHead,
    fetchFeedbackByTask,
    fetchFeedbackByPersona,
    insertApiMetric,
    fetchMemory,
    updateMemory
};