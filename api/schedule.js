const { readJSON, writeJSON } = require("./_blob");

const PASSWORD = process.env.EDIT_PASSWORD || "CSAI.clubss";
const PATH = "data/schedule.json";

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const entries = await readJSON(PATH, {});
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

      const entries = await readJSON(PATH, {});
      const value = (description || "").trim();

      if (value) {
        entries[date] = value;
      } else {
        delete entries[date];
      }

      await writeJSON(PATH, entries);
      res.status(200).json(entries);
      return;
    }

    if (req.method === "DELETE") {
      const { date, password } = req.body || {};

      if (password !== PASSWORD) {
        res.status(401).json({ error: "Incorrect password" });
        return;
      }

      const entries = await readJSON(PATH, {});
      delete entries[date];
      await writeJSON(PATH, entries);
      res.status(200).json(entries);
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("schedule API error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
};
