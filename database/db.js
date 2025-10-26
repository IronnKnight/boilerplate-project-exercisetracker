const { Database } = require("sqlite-async");

let db;

async function initDatabase() {
  try {
    db = await Database.open("./exercise_tracker.db");

    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        duration INTEGER NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

function getDatabase() {
  return db;
}

module.exports = {
  initDatabase,
  getDatabase,
};
