import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing url parameter");

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Referer": "https://www.123tv.fun/",
        "Origin": "https://www.123tv.fun"
      },
    });

    // نفس headers للبث HLS
    res.set({
      "Content-Type": response.headers.get("content-type"),
      "Access-Control-Allow-Origin": "*",
    });

    response.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
});

app.listen(10000, () => console.log("✅ HLS Proxy running on port 10000"));
