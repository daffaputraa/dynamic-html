// server/index.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const app = express();

// Helper function to read file as promise
const readFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data);
    });
  });
};

// Function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// Serve static files
app.use(express.static(path.join(__dirname, "../build")));

// Handle article detail routes
app.get("/:id/:slug", async (req, res) => {
  try {
    const { id, slug } = req.params;

    // Fetch article data
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/artikel/kajian`
    );
    const articles = response.data;

    // Find matching article
    const article = articles.find((item) => item._id === id);

    if (!article) {
      const indexHtml = await readFile(
        path.join(__dirname, "../build/index.html")
      );
      return res.send(indexHtml);
    }

    // Read the index.html file
    const indexHtml = await readFile(
      path.join(__dirname, "../build/index.html")
    );

    // Get the image URL
    const imageUrl = `${process.env.REACT_APP_BASE_URL}/getimage/${article.gambar}`;
    const articleUrl = `${process.env.REACT_APP_FRONTEND_URL}/${id}/${slug}`;

    // Strip HTML tags from description
    const cleanDescription =
      article.deskripsi.replace(/<[^>]*>/g, "").slice(0, 160) + "...";

    // Replace meta tags
    const updatedHTML = indexHtml
      .replace(
        "<title>React App</title>",
        `<title>${article.judul_artikel}</title>`
      )
      .replace(
        'content="Web site created using create-react-app"',
        `content="${cleanDescription}"`
      )
      .replace(
        /<meta property="og:title".*?>/g,
        `<meta property="og:title" content="${article.judul_artikel}">`
      )
      .replace(
        /<meta property="og:description".*?>/g,
        `<meta property="og:description" content="${cleanDescription}">`
      )
      .replace(
        /<meta property="og:image".*?>/g,
        `<meta property="og:image" content="${imageUrl}">`
      )
      .replace(
        /<meta property="og:url".*?>/g,
        `<meta property="og:url" content="${articleUrl}">`
      )
      .replace(
        /<meta name="twitter:card".*?>/g,
        '<meta name="twitter:card" content="summary_large_image">'
      )
      .replace(
        /<meta name="twitter:title".*?>/g,
        `<meta name="twitter:title" content="${article.judul_artikel}">`
      )
      .replace(
        /<meta name="twitter:description".*?>/g,
        `<meta name="twitter:description" content="${cleanDescription}">`
      )
      .replace(
        /<meta name="twitter:image".*?>/g,
        `<meta name="twitter:image" content="${imageUrl}">`
      );

    res.send(updatedHTML);
  } catch (error) {
    console.error("Error handling article route:", error);
    res.status(500).send("Server error");
  }
});

// Handle all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}

// Export the Express API
module.exports = app;
