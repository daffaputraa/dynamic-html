// // server/index.js
// const express = require('express');
// const path = require('path');
// const fs = require('fs');
// const axios = require('axios');

// const app = express();

// // Add CSP headers middleware
// app.use((req, res, next) => {
//   res.setHeader(
//     'Content-Security-Policy',
//     "default-src 'self' https://api.idrisiyyah.or.id:3000 https://vercel.live; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' https://api.idrisiyyah.or.id:3000 data: blob: https:; font-src 'self' data:;"
//   );
//   next();
// });

// // Serve static files
// app.use(express.static(path.join(__dirname, '../build')));

// // Function to generate slug
// const generateSlug = (title) => {
//   return title
//     .toLowerCase()
//     .replace(/[^\w\s-]/g, '')
//     .trim()
//     .replace(/\s+/g, '-')
//     .replace(/-+/g, '-');
// };

// // Handle article routes
// const handleArticle = async (req, res) => {
//   try {
//     const indexPath = path.join(__dirname, '../build/index.html');
    
//     // Read the index.html file first
//     const htmlData = await fs.promises.readFile(indexPath, 'utf8');
    
//     const { id } = req.params;
    
//     // If no ID, just send the index.html
//     if (!id) {
//       return res.send(htmlData);
//     }

//     try {
//       // Fetch article data
//       const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/artikel/kajian`);
//       const article = response.data.find(item => item._id === id);

//       if (!article) {
//         return res.send(htmlData);
//       }

//       // Get the image URL and article URL
//       const imageUrl = `${process.env.REACT_APP_BASE_URL}/getimage/${article.gambar}`;
//       const articleUrl = `${process.env.REACT_APP_FRONTEND_URL}/${id}/${generateSlug(article.judul_artikel)}`;
      
//       // Clean description
//       const cleanDescription = article.deskripsi
//         .replace(/<[^>]*>/g, '')
//         .slice(0, 160) + '...';

//       // Update meta tags
//       const updatedHTML = htmlData
//         .replace('<title>React App</title>', `<title>${article.judul_artikel}</title>`)
//         .replace('content="Web site created using create-react-app"',
//                 `content="${cleanDescription}"`)
//         .replace(/<meta property="og:title".*?>/g,
//                 `<meta property="og:title" content="${article.judul_artikel}">`)
//         .replace(/<meta property="og:description".*?>/g,
//                 `<meta property="og:description" content="${cleanDescription}">`)
//         .replace(/<meta property="og:image".*?>/g,
//                 `<meta property="og:image" content="${imageUrl}">`)
//         .replace(/<meta property="og:url".*?>/g,
//                 `<meta property="og:url" content="${articleUrl}">`)
//         .replace(/<meta name="twitter:card".*?>/g,
//                 '<meta name="twitter:card" content="summary_large_image">')
//         .replace(/<meta name="twitter:title".*?>/g,
//                 `<meta name="twitter:title" content="${article.judul_artikel}">`)
//         .replace(/<meta name="twitter:description".*?>/g,
//                 `<meta name="twitter:description" content="${cleanDescription}">`)
//         .replace(/<meta name="twitter:image".*?>/g,
//                 `<meta name="twitter:image" content="${imageUrl}">`);

//       res.send(updatedHTML);
//     } catch (error) {
//       console.error('Error fetching article:', error);
//       res.send(htmlData);
//     }
//   } catch (error) {
//     console.error('Error reading index.html:', error);
//     res.status(500).send('Internal Server Error');
//   }
// };

// // Define routes
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../build/index.html'));
// });

// app.get('/:id/:slug', handleArticle);
// app.get('/:id', handleArticle);

// // Handle all other routes
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../build/index.html'));
// });

// // For development
// if (process.env.NODE_ENV !== 'production') {
//   const PORT = process.env.PORT || 3000;
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// }

// module.exports = app;


const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();

// Serve static files from the build folder
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

// Parse path untuk mendapatkan ID
const parsePathForId = (path) => {
  const parts = path.split('/').filter(Boolean);
  return parts.length >= 1 ? parts[0] : null;
};

// Handle semua routes
app.get('/*', async (req, res) => {
  try {
    const indexPath = path.join(__dirname, '../build/index.html');
    const htmlData = await fs.promises.readFile(indexPath, 'utf8');
    
    const id = parsePathForId(req.path);
    
    // Jika di homepage atau tidak ada ID
    if (!id) {
      return res.send(htmlData);
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/artikel/kajian`);
      const article = response.data.find(item => item._id === id);

      if (!article) {
        return res.send(htmlData);
      }

      // Clean description untuk meta tags
      const cleanDescription = article.deskripsi
        .replace(/<[^>]*>/g, '')
        .slice(0, 160)
        .trim();

      // Generate URLs
      const imageUrl = `${process.env.REACT_APP_BASE_URL}/getimage/${article.gambar}`;
      const articleSlug = generateSlug(article.judul_artikel);
      const articleUrl = `${req.protocol}://${req.get('host')}/${id}/${articleSlug}`;

      // Meta tags sesuai dengan artikel
      const metaTags = `
        <title>${article.judul_artikel}</title>
        <meta name="description" content="${cleanDescription}">
        <meta property="og:title" content="${article.judul_artikel}">
        <meta property="og:description" content="${cleanDescription}">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:url" content="${articleUrl}">
        <meta property="og:type" content="article">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${article.judul_artikel}">
        <meta name="twitter:description" content="${cleanDescription}">
        <meta name="twitter:image" content="${imageUrl}">
      `;

      // Replace meta tags di HTML
      const updatedHTML = htmlData.replace(
        /<title>.*?<\/title>/,
        metaTags
      );

      res.send(updatedHTML);

    } catch (error) {
      console.error('Error fetching article:', error);
      res.send(htmlData);
    }
  } catch (error) {
    console.error('Error reading index.html:', error);
    res.status(500).send('Internal Server Error');
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;