import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import parse from "html-react-parser";



const DetailHalaman = () => {
  const { id } = useParams(); // Mengambil ID artikel dari URL
  const [artikel, setArtikel] = useState(null); // Menyimpan data artikel
  const [loading, setLoading] = useState(true); // State untuk menampilkan loading

  useEffect(() => {
    const fetchArtikel = async () => {
      try {
        const baseUrl = process.env.REACT_APP_BASE_URL;
        const response = await axios.get(`${baseUrl}/artikel/kajian`);

        
        setArtikel(response.data.find((ele, index)=> {
            return ele._id === id
        })); 

        console.log(artikel.judul_artikel)

        setLoading(false);
      } catch (error) {
        console.error(`Error fetching article: ${error.message}`);
        setLoading(false);
      }
    };

    fetchArtikel();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!artikel) {
    return <div>Artikel tidak ditemukan.</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        {/* Gambar Artikel */}
        {artikel.gambar && (
          <img
            src={`https://api.idrisiyyah.or.id:3000/getimage/${artikel.gambar}`}
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

        <h1 className="text-base font-normal mb-2">
          {parse(artikel.deskripsi)}
        </h1>
      </div>
    </main>
  );
};

export default DetailHalaman;
