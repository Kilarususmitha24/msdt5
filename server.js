const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const filePath = path.join(__dirname, "users.json");

app.use(express.json());

// ✅ Helper to safely read users
function readUsers() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf-8");
      return [];
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
}

// ✅ Helper to write users
function writeUsers(users) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing file:", err);
  }
}

// 🟢 GET /users → Return all users
app.get("/users", (req, res) => {
  const users = readUsers();
  res.json(users);
});

// 🟢 POST /users → Add a new user
app.post("/users", (req, res) => {
  const { name, age } = req.body;

  if (!name || typeof age !== "number") {
    return res.status(400).json({ error: "Invalid input. Require name and age." });
  }

  const users = readUsers();
  const newId = users.length ? users[users.length - 1].id + 1 : 1;
  const newUser = { id: newId, name, age };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json(newUser);
});

// 🟢 PUT /users/:id → Update user details by ID
app.put("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, age } = req.body;

  if (!name && typeof age !== "number") {
    return res.status(400).json({ error: "Provide name or age to update." });
  }

  const users = readUsers();
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (name) user.name = name;
  if (typeof age === "number") user.age = age;

  writeUsers(users);
  res.json(user);
});

// 🟢 DELETE /users/:id → Delete user by ID
app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const users = readUsers();
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  users.splice(index, 1);
  writeUsers(users);
  res.json({ message: "User deleted successfully." });
});

// ⭐ BONUS: GET /users/search?name=keyword → Case-insensitive name search
app.get("/users/search", (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: "Please provide a name keyword." });
  }

  const users = readUsers();
  const keyword = name.toLowerCase();
  const results = users.filter(u => u.name.toLowerCase().includes(keyword));

  res.json(results);
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("✅ User API is running! Use /users to view data.");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
