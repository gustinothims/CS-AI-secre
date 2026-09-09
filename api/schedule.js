const { kv } = require("@vercel/kv");

const PASSWORD = process.env.EDIT_PASSWORD || "CSAI.clubss";
const KEY = "schedule:entries";

module.exports = async (req, res) => {
  if (req.method === "GET") {
    const entries = (await kv.get(KEY)) || {};
    res.status(200).json(entries);
    return;
  }

  if (req.method === "POST") {
    const { date, description, password } = req.body || {};

    if (password !== PASSWORD) {
      res.status(401).json({ error: "Incorrect password" });
      return;
    }
    if (!date) {
      res.status(400).json({ error: "Missing date" });
      return;
    }

    const entries = (await kv.get(KEY)) || {};
    const value = (description || "").trim();

    if (value) {
      entries[date] = value;
    } else {
      delete entries[date];
    }

    await kv.set(KEY, entries);
    res.status(200).json(entries);
    return;
  }

  if (req.method === "DELETE") {
    const { date, password } = req.body || {};

    if (password !== PASSWORD) {
      res.status(401).json({ error: "Incorrect password" });
      return;
    }

    const entries = (await kv.get(KEY)) || {};
    delete entries[date];
    await kv.set(KEY, entries);
    res.status(200).json(entries);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
};
