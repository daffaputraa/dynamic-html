require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.REACT_APP_BASE_URL || "https://api.idrisiyyah.or.id:3000";

// Enable CORS
app.use(cors());

// Create API proxy
const apiProxy = createProxyMiddleware({
  target: API_BASE_URL,
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    "^/api": "",
  },
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers["Access-Control-Allow-Origin"] = "*";
    proxyRes.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    proxyRes.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
  },
  onError: function (err, req, res) {
    console.error("Proxy Error:", err);
    res.status(500).send("Proxy Error");
  },
});

// Use proxy for API requests
app.use("/api", apiProxy);

// Serve static files
app.use(express.static(path.join(__dirname, "../build")));

// Generate slug function
const generateSlug = (title) => {
  return title
    ?.toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// Helper to strip HTML and clean text
const stripHtml = (html) => {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// Enhanced meta tags injection
const injectMetaTags = (htmlData, article) => {
  if (!article) return htmlData;

  const imageUrl = `${API_BASE_URL}/getimage/${article.gambar}`;
  const articleUrl = `${process.env.REACT_APP_FRONTEND_URL}/${article._id}/${generateSlug(article.judul_artikel)}`;
  const description = stripHtml(article.deskripsi).slice(0, 160) + "...";
  const title = `${article.judul_artikel} - Portal Kajian Idrisiyyah`;

  const metaTags = {
    "<title>.*?</title>": `<title>${title}</title>`,
    '<meta name="description".*?>': `<meta name="description" content="${description}">`,
    '<meta property="og:title".*?>': `<meta property="og:title" content="${title}">`,
    '<meta property="og:description".*?>': `<meta property="og:description" content="${description}">`,
    '<meta property="og:image".*?>': `<meta property="og:image" content="${imageUrl}">`,
    '<meta property="og:url".*?>': `<meta property="og:url" content="${articleUrl}">`,
    '<meta property="og:type".*?>': '<meta property="og:type" content="article">',
    '<meta name="twitter:card".*?>': '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title".*?>': `<meta name="twitter:title" content="${title}">`,
    '<meta name="twitter:description".*?>': `<meta name="twitter:description" content="${description}">`,
    '<meta name="twitter:image".*?>': `<meta name="twitter:image" content="${imageUrl}">`,
    '<meta name="twitter:url".*?>': `<meta name="twitter:url" content="${articleUrl}">`,
    '<link rel="canonical".*?>': `<link rel="canonical" href="${articleUrl}">`,
  };

  let updatedHtml = htmlData;
  Object.entries(metaTags).forEach(([pattern, replacement]) => {
    updatedHtml = updatedHtml.replace(new RegExp(pattern, "i"), replacement);
  });

  return updatedHtml;
};

// Handle routes for articles
app.get("/:id/:slug", async (req, res) => {
  try {
    const { id, slug } = req.params;

    // Fetch article data
    const response = await axios.get(`${API_BASE_URL}/artikel/kajian`, {
      timeout: 5000,
    });

    if (!response.data) {
      throw new Error("No data received from API");
    }

    const article = response.data.find((item) => item._id === id);

    if (!article) {
      return res.status(404).send("Article not found");
    }

    // Read and inject meta tags
    const indexPath = path.resolve(__dirname, "../build/index.html");
    fs.readFile(indexPath, "utf8", (err, htmlData) => {
      if (err) {
        console.error("Error reading index.html:", err);
        return res.status(500).send("Error reading index.html");
      }

      const updatedHtml = injectMetaTags(htmlData, article);
      res.send(updatedHtml);
    });
  } catch (error) {
    console.error("Error handling article route:", error);
    res.status(500).send("Server error");
  }
});

// Handle all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Base URL: ${API_BASE_URL}`);
});