const { readJSON, writeJSON } = require("./_blob");

const PASSWORD = process.env.EDIT_PASSWORD || "CSAI.clubss";
const PATH = "data/news.json";

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const posts = await readJSON(PATH, []);
      res.status(200).json(posts);
      return;
    }

    if (req.method === "POST") {
      const { title, body, password } = req.body || {};

      if (password !== PASSWORD) {
        res.status(401).json({ error: "Incorrect password" });
        return;
      }
      if (!title || !body) {
        res.status(400).json({ error: "Missing title or body" });
        return;
      }

      const posts = await readJSON(PATH, []);
      posts.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim(),
        body: body.trim(),
        createdAt: new Date().toISOString(),
      });

      await writeJSON(PATH, posts);
      res.status(200).json(posts);
      return;
    }

    if (req.method === "PUT") {
      const { id, title, body, password } = req.body || {};

      if (password !== PASSWORD) {
        res.status(401).json({ error: "Incorrect password" });
        return;
      }
      if (!id || !title || !body) {
        res.status(400).json({ error: "Missing id, title, or body" });
        return;
      }

      const posts = await readJSON(PATH, []);
      const post = posts.find((p) => p.id === id);
      if (post) {
        post.title = title.trim();
        post.body = body.trim();
      }

      await writeJSON(PATH, posts);
      res.status(200).json(posts);
      return;
    }

    if (req.method === "DELETE") {
      const { id, password } = req.body || {};

      if (password !== PASSWORD) {
        res.status(401).json({ error: "Incorrect password" });
        return;
      }

      const posts = (await readJSON(PATH, [])).filter((p) => p.id !== id);
      await writeJSON(PATH, posts);
      res.status(200).json(posts);
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("news API error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
};
