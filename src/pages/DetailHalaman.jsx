import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import parse from "html-react-parser";
import { Helmet } from "react-helmet"; // Tambahkan import untuk Helmet

const DetailHalaman = () => {
  const { id } = useParams();
  const [artikel, setArtikel] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchArtikel = async () => {
      try {
        const response = await axios.get(`${baseUrl}/artikel/kajian`);
        const foundArtikel = response.data.find((ele) => ele._id === id);
        setArtikel(foundArtikel);
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching article: ${error.message}`);
        setLoading(false);
      }
    };

    fetchArtikel();
  }, [id, baseUrl]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!artikel) {
    return <div>Artikel tidak ditemukan.</div>;
  }

  // Buat clean description untuk meta tags
  const cleanDescription =
    artikel.deskripsi.replace(/<[^>]*>/g, "").slice(0, 160) + "...";

  return (
    <>
      <Helmet>
        {/* Basic meta tags */}
        <title>{artikel.judul_artikel}</title>
        <meta name="description" content={cleanDescription} />

        {/* Open Graph meta tags */}
        <meta property="og:title" content={artikel.judul_artikel} />
        <meta property="og:description" content={cleanDescription} />
        <meta property="og:type" content="article" />
        <meta
          property="og:image"
          content={`${baseUrl}/getimage/${artikel.gambar}`}
        />
        <meta property="og:url" content={window.location.href} />

        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={artikel.judul_artikel} />
        <meta name="twitter:description" content={cleanDescription} />
        <meta
          name="twitter:image"
          content={`${baseUrl}/getimage/${artikel.gambar}`}
        />
      </Helmet>

      <main className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          {/* Gambar Artikel */}
          {artikel.gambar && (
            <img
              src={`${baseUrl}/getimage/${artikel.gambar}`}
              alt={artikel.judul_artikel}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}

          {/* Judul Artikel */}
          <h1 className="text-3xl font-bold mb-2">{artikel.judul_artikel}</h1>

          {/* Narasumber */}
          {artikel.narasumber && (
            <p className="text-gray-600 mb-2">
              Oleh: <span className="font-semibold">{artikel.narasumber}</span>
            </p>
          )}

          {/* Konten Artikel */}
          <div className="prose max-w-none">{parse(artikel.deskripsi)}</div>
        </div>
      </main>
    </>
  );
};

export default DetailHalaman;
