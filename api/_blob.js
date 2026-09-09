const { put, list } = require("@vercel/blob");

async function readJSON(pathname, fallback) {
  const { blobs } = await list({ prefix: pathname, limit: 1 });
  const match = blobs.find((b) => b.pathname === pathname);
  if (!match) return fallback;

  const res = await fetch(match.url, { cache: "no-store" });
  if (!res.ok) return fallback;
  return res.json();
}

async function writeJSON(pathname, data) {
  await put(pathname, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

module.exports = { readJSON, writeJSON };
