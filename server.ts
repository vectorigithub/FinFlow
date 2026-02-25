import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("finance.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS debts (
    id TEXT PRIMARY KEY,
    name TEXT,
    amount REAL,
    interestRate REAL,
    dueDate TEXT,
    category TEXT,
    notes TEXT
  );
  CREATE TABLE IF NOT EXISTS investments (
    id TEXT PRIMARY KEY,
    name TEXT,
    amount REAL,
    expectedReturn REAL,
    type TEXT,
    notes TEXT
  );
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    name TEXT,
    amount REAL,
    date TEXT,
    category TEXT,
    isRecurring INTEGER,
    notes TEXT
  );
  CREATE TABLE IF NOT EXISTS income_sources (
    id TEXT PRIMARY KEY,
    name TEXT,
    amount REAL,
    frequency TEXT,
    receivedMonth TEXT,
    purpose TEXT
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.get("/api/data", (req, res) => {
    const debts = db.prepare("SELECT * FROM debts").all();
    const investments = db.prepare("SELECT * FROM investments").all();
    const expenses = db.prepare("SELECT * FROM expenses").all();
    const incomeSources = db.prepare("SELECT * FROM income_sources").all();
    
    res.json({
      debts,
      investments,
      expenses,
      incomeSources
    });
  });

  app.get("/api/export", (req, res) => {
    const debts = db.prepare("SELECT * FROM debts").all();
    const investments = db.prepare("SELECT * FROM investments").all();
    const expenses = db.prepare("SELECT * FROM expenses").all();
    const incomeSources = db.prepare("SELECT * FROM income_sources").all();
    const settings = db.prepare("SELECT * FROM settings").all();
    
    const data = {
      debts,
      investments,
      expenses,
      incomeSources,
      settings,
      exportDate: new Date().toISOString()
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=finflow_export.json');
    res.send(JSON.stringify(data, null, 2));
  });

  app.post("/api/debts", (req, res) => {
    const { id, name, amount, interestRate, dueDate, category, notes } = req.body;
    db.prepare("INSERT OR REPLACE INTO debts (id, name, amount, interestRate, dueDate, category, notes) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, amount, interestRate, dueDate, category, notes || "");
    res.json({ success: true });
  });

  app.delete("/api/debts/:id", (req, res) => {
    db.prepare("DELETE FROM debts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/investments", (req, res) => {
    const { id, name, amount, expectedReturn, type, notes } = req.body;
    db.prepare("INSERT OR REPLACE INTO investments (id, name, amount, expectedReturn, type, notes) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, name, amount, expectedReturn, type, notes || "");
    res.json({ success: true });
  });

  app.delete("/api/investments/:id", (req, res) => {
    db.prepare("DELETE FROM investments WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/expenses", (req, res) => {
    const { id, name, amount, date, category, isRecurring, notes } = req.body;
    db.prepare("INSERT OR REPLACE INTO expenses (id, name, amount, date, category, isRecurring, notes) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, amount, date, category, isRecurring ? 1 : 0, notes || "");
    res.json({ success: true });
  });

  app.delete("/api/expenses/:id", (req, res) => {
    db.prepare("DELETE FROM expenses WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/income", (req, res) => {
    const { id, name, amount, frequency, receivedMonth, purpose } = req.body;
    db.prepare("INSERT OR REPLACE INTO income_sources (id, name, amount, frequency, receivedMonth, purpose) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, name, amount, frequency, receivedMonth || "", purpose || "");
    res.json({ success: true });
  });

  app.delete("/api/income/:id", (req, res) => {
    db.prepare("DELETE FROM income_sources WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/settings", (req, res) => {
    const { key, value } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
      .run(key, value.toString());
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
