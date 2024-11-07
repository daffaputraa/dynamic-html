import axios from 'axios';
import React, { useEffect, useState } from 'react'
import parse from "html-react-parser";
import { Link } from 'react-router-dom';

const HomePage = () => {

const baseUrl =
    process.env.REACT_APP_BASE_URL || "https://api.idrisiyyah.or.id:3000";
    const [data, setData] = useState([])


    const createSlug = (judul) => {
        return judul
        .toLowerCase() // Ubah menjadi huruf kecil
        .replace(/[^a-zA-Z0-9\s-]/g, "") // Hapus karakter selain huruf, angka, spasi, dan tanda hubung
        .trim() // Hapus spasi di awal dan akhir
        .replace(/\s+/g, "-") // Gantikan spasi dengan tanda hubung
        .replace(/-+/g, "-"); // Gantikan tanda hubung ganda dengan satu tanda hubung
    };

    
    useEffect(()=> {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${baseUrl}/artikel/kajian`);
                setData(res.data)

                if (res.data) {
                    console.log(data.map((ele, index)=> ele.judul_artikel))
                }
            } catch (error) {
                console.error(`Ini pesan error ${error.message}`)
            }
        }
        fetchData()
    }, [baseUrl])

    const CardComponents = ({ judul, deksripsi, gambar, id }) => (
      <Link to={`${id}/${createSlug(judul)}`}>
        <div className="card px-7 py-5 shadow-sm shadow-neutral-100 border border-neutral-100 rounded hover:bg-neutral-200 bg-neutral-50 transition-all hover:shadow-sm min-w-[250px] max-w-[400px]">
          <img
            src={`https://api.idrisiyyah.or.id:3000/getimage/${gambar}`}
            alt=""
            srcset=""
          />
          <div className="text">
            <h1 className="text-2xl font-bold">{judul}</h1>
            <p className="text-sm font-normal text-neutral-600 line-clamp-4">
              {parse(deksripsi)}
            </p>
          </div>
        </div>
      </Link>
    );

  return (
    <>
    <main>
        {data.length ?  
    
        (<>
        <div className="container flex flex-row gap-4 flex-wrap">
            {data.map((ele, index)=> {       
                return (
                    <CardComponents id={ele._id} key={index} judul={ele.judul_artikel} deksripsi={ele.deskripsi} gambar={ele.gambar}/>
                );   
            })}
        </div>
        </> ) : (<h1>Loading...</h1>)} 
    </main>
    </>
  )
}

export default HomePage