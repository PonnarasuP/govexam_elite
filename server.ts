import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple In-Memory Cache
  let cache: { tnpsc: any, upsc: any, lastFetch: number } = { tnpsc: null, upsc: null, lastFetch: 0 };
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Scraping Endpoint for TNPSC
  app.get("/api/scrape/tnpsc", async (req, res) => {
    const now = Date.now();
    if (cache.tnpsc && (now - cache.lastFetch < CACHE_DURATION)) {
      return res.json(cache.tnpsc);
    }

    try {
      const response = await axios.get("https://www.tnpsc.gov.in/english/latest-notification.html", {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 5000
      });
      const $ = cheerio.load(response.data);
      const notifications: any[] = [];

      $("table tr").each((i, el) => {
        if (i === 0) return;
        const cols = $(el).find("td");
        if (cols.length >= 3) {
          notifications.push({
            title: $(cols[1]).text().trim(),
            date: $(cols[2]).text().trim(),
            link: "https://www.tnpsc.gov.in/" + $(cols[1]).find("a").attr("href"),
            source: "TNPSC"
          });
        }
      });

      cache.tnpsc = notifications.slice(0, 10);
      cache.lastFetch = now;
      res.json(cache.tnpsc);
    } catch (error) {
      console.error("TNPSC Scrape Error:", error);
      if (cache.tnpsc) return res.json(cache.tnpsc); // Return stale cache on error
      res.status(500).json({ error: "Failed to scrape TNPSC" });
    }
  });

  // Scraping Endpoint for UPSC
  app.get("/api/scrape/upsc", async (req, res) => {
    const now = Date.now();
    if (cache.upsc && (now - cache.lastFetch < CACHE_DURATION)) {
      return res.json(cache.upsc);
    }

    try {
      const response = await axios.get("https://www.upsc.gov.in/whats-new", {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 5000
      });
      const $ = cheerio.load(response.data);
      const notifications: any[] = [];

      $(".view-content .views-row").each((i, el) => {
        const link = $(el).find("a");
        notifications.push({
          title: link.text().trim(),
          date: new Date().toLocaleDateString(),
          link: "https://www.upsc.gov.in" + link.attr("href"),
          source: "UPSC"
        });
      });

      cache.upsc = notifications.slice(0, 10);
      cache.lastFetch = now;
      res.json(cache.upsc);
    } catch (error) {
      console.error("UPSC Scrape Error:", error);
      if (cache.upsc) return res.json(cache.upsc); // Return stale cache on error
      res.status(500).json({ error: "Failed to scrape UPSC" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
