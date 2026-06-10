const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

// אבטחה בסיסית: אם מוגדר LIST_TOKEN בסביבה, ה-API דורש אותו בכותרת.
// בלעדיו כל מי שמכיר את הכתובת יכול לערוך את הרשימה.
const TOKEN = process.env.LIST_TOKEN || null;
app.use("/api", (req, res, next) => {
  if (TOKEN && req.headers["x-list-token"] !== TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
});

app.use(express.static(path.join(__dirname, "public")));

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);
let lists;

app.get("/api/list", async (req, res) => {
  try {
    const doc = await lists.findOne({ _id: "family" });
    res.json({ items: doc?.items ?? [], ts: doc?.ts ?? 0 });
  } catch (e) {
    res.status(500).json({ error: "db_error" });
  }
});

app.put("/api/list", async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const ts = Date.now();
    await lists.updateOne(
      { _id: "family" },
      { $set: { items, ts } },
      { upsert: true }
    );
    res.json({ ok: true, ts });
  } catch (e) {
    res.status(500).json({ error: "db_error" });
  }
});

async function start() {
  await client.connect();
  lists = client.db("shopping").collection("lists");
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Shopping list running on :${port}`));
}

start().catch((e) => {
  console.error("Failed to start:", e.message);
  process.exit(1);
});
