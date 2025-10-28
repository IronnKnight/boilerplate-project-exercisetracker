import { getDatabase } from "../database/db.js";

async function createUser(req, res) {
  try {
    const { username } = req.body;
    const db = getDatabase();

    if (!username || username.trim() === "") {
      return res.status(400).json({ error: "Username is required" });
    }

    const existingUser = await db.get(
      "SELECT id FROM users WHERE username = ?",
      [username.trim()]
    );
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const result = await db.run("INSERT INTO users (username) VALUES (?)", [
      username.trim(),
    ]);

    res.json({
      id: result.lastID,
      username: username.trim(),
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getAllUsers(req, res) {
  try {
    const db = getDatabase();
    const users = await db.all("SELECT id, username FROM users");

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function addExercise(req, res) {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;
    const db = getDatabase();

    if (!description || description.trim() === "") {
      return res.status(400).json({ error: "Description is required" });
    }

    if (!duration || isNaN(duration) || duration <= 0) {
      return res
        .status(400)
        .json({ error: "Duration must be a greater than 0" });
    }

    const user = await db.get("SELECT id, username FROM users WHERE id = ?", [
      _id,
    ]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const exerciseDate = date || new Date().toISOString().split("T")[0];

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(exerciseDate)) {
      return res
        .status(400)
        .json({ error: "Date must be in YYYY-MM-DD format" });
    }

    const dateObj = new Date(exerciseDate);
    const [year, month, day] = exerciseDate.split("-").map(Number);
    console.log(dateObj.getFullYear(), year, dateObj.getMonth(), month - 1, dateObj.getDate(), day);
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      return res.status(400).json({ error: "Invalid date" });
    }

    const result = await db.run(
      "INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)",
      [_id, description.trim(), parseInt(duration), exerciseDate]
    );

    res.json({
      userId: parseInt(_id),
      exerciseId: result.lastID,
      duration: parseInt(duration),
      description: description.trim(),
      date: exerciseDate,
    });
  } catch (error) {
    console.error("Error adding exercise:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getUserLogs(req, res) {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;
    const db = getDatabase();

    const user = await db.get("SELECT id, username FROM users WHERE id = ?", [
      _id,
    ]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let query =
      "SELECT id, description, duration, date FROM exercises WHERE user_id = ?";
    const params = [_id];

    if (from) {
      query += " AND date >= ?";
      params.push(from);
    }

    if (to) {
      query += " AND date <= ?";
      params.push(to);
    }

    query += " ORDER BY date ASC";

    if (limit && !isNaN(limit) && limit > 0) {
      query += " LIMIT ?";
      params.push(parseInt(limit));
    }

    const exercises = await db.all(query, params);

    let countQuery =
      "SELECT COUNT(*) as count FROM exercises WHERE user_id = ?";
    const countParams = [_id];

    if (from) {
      countQuery += " AND date >= ?";
      countParams.push(from);
    }

    if (to) {
      countQuery += " AND date <= ?";
      countParams.push(to);
    }

    const countResult = await db.get(countQuery, countParams);

    res.json({
      id: user.id,
      username: user.username,
      logs: exercises,
      count: countResult.count,
    });
  } catch (error) {
    console.error("Error fetching user logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export { createUser, getAllUsers, addExercise, getUserLogs };
