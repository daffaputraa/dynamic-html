// server/index.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '../build')));

// Function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// Handle article detail routes
const handleArticle = async (req, res) => {
  try {
    const indexPath = path.join(__dirname, '../build/index.html');
    const { id } = req.params;
    
    // If no ID, just send the index.html
    if (!id) {
      return res.sendFile(indexPath);
    }
    
    // Fetch article data
    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/artikel/kajian`);
    const articles = response.data;
    
    // Find matching article
    const article = articles.find(item => item._id === id);
    
    if (!article) {
      return res.sendFile(indexPath);
    }

    // Read the index.html file
    fs.readFile(indexPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading index.html:', err);
        return res.sendFile(indexPath);
      }

      // Get the image URL
      const imageUrl = `${process.env.REACT_APP_BASE_URL}/getimage/${article.gambar}`;
      const articleUrl = `${process.env.REACT_APP_FRONTEND_URL}/${id}/${generateSlug(article.judul_artikel)}`;
      
      // Strip HTML tags from description
      const cleanDescription = article.deskripsi
        .replace(/<[^>]*>/g, '')
        .slice(0, 160) + '...';

      // Replace meta tags
      const updatedHTML = data
        .replace('<title>React App</title>', `<title>${article.judul_artikel}</title>`)
        .replace('content="Web site created using create-react-app"',
                `content="${cleanDescription}"`)
        .replace(/<meta property="og:title".*?>/g,
                `<meta property="og:title" content="${article.judul_artikel}">`)
        .replace(/<meta property="og:description".*?>/g,
                `<meta property="og:description" content="${cleanDescription}">`)
        .replace(/<meta property="og:image".*?>/g,
                `<meta property="og:image" content="${imageUrl}">`)
        .replace(/<meta property="og:url".*?>/g,
                `<meta property="og:url" content="${articleUrl}">`)
        .replace(/<meta name="twitter:card".*?>/g,
                '<meta name="twitter:card" content="summary_large_image">')
        .replace(/<meta name="twitter:title".*?>/g,
                `<meta name="twitter:title" content="${article.judul_artikel}">`)
        .replace(/<meta name="twitter:description".*?>/g,
                `<meta name="twitter:description" content="${cleanDescription}">`)
        .replace(/<meta name="twitter:image".*?>/g,
                `<meta name="twitter:image" content="${imageUrl}">`);

      res.send(updatedHTML);
    });
  } catch (error) {
    console.error('Error handling article route:', error);
    res.sendFile(path.join(__dirname, '../build/index.html'));
  }
};

// Define routes
app.get('/:id/:slug', handleArticle);
app.get('/:id', handleArticle);
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Handle all other routes - Important for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// For development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the Express API
module.exports = app;