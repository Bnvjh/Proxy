import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

const FORCED_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36";

app.use(cors());
app.get("/", async (req, res) => {
  try {
    const target = req.query.url;
    if (!target) return res.status(400).send("Missing ?url parameter");

    const response = await fetch(target, {
      headers: {
        "User-Agent": FORCED_UA,
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Accept-Encoding": "gzip, deflate, br",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    if (contentType.includes("mpegurl") || target.endsWith(".m3u8")) {
      const text = await response.text();
      const base = target.substring(0, target.lastIndexOf("/") + 1);
      const rewritten = text.replace(
        /^(?!#)(.*\.m3u8|.*\.ts|.*\.m4s|https?:\/\/[^\s]+)/gm,
        (match) => {
          let abs = match.trim();
          if (!abs.startsWith("http")) abs = new URL(abs, base).href;
          return `${req.protocol}://${req.get("host")}/?url=${encodeURIComponent(abs)}`;
        }
      );
      res.setHeader("content-type", "application/vnd.apple.mpegurl");
      return res.status(200).send(rewritten);
    }

    res.setHeader("Content-Type", contentType);
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
});

app.listen(PORT, () => console.log("✅ HLS Proxy running on port " + PORT));
