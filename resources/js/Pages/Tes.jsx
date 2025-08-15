import React, { useEffect, useState } from "react";
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Tes() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fakultasCompleteCount, setFakultasCompleteCount] = useState({});
  const [prodiCompleteCount, setProdiCompleteCount] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/tes/all");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let allItems = [];
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split("\n");
        buffer = lines.pop(); // sisa partial JSON
  
        for (let line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (Array.isArray(parsed)) {
                allItems.push(...parsed);
              } else {
                allItems.push(parsed);
              }
            } catch (err) {
              console.error("JSON parse error:", err, line);
            }
          }
        }
      }
  
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (Array.isArray(parsed)) {
            allItems.push(...parsed);
          } else {
            allItems.push(parsed);
          }
        } catch (err) {
          console.error("JSON parse error (final buffer):", err, buffer);
        }
      }
  
      setAllData(allItems);
      setLoading(false);
    };
  
    fetchData();
  }, []); 

  useEffect(() => {
    if (!loading && allData.length > 0) {
      const filteredComplete = allData.filter(item => item.status_pengisian === "isi lengkap");

      // Hitung per fakultas
      const fakultasResult = filteredComplete.reduce((acc, item) => {
        let namaFak = item?.mhs
          ? item.mhs?.fakultas?.nama_fakultas || "Tidak diketahui"
          : item?.dosen
            ? item.dosen?.prodi?.fakultas?.nama_fakultas || "Tidak diketahui"
            : "Tidak diketahui";
        acc[namaFak] = (acc[namaFak] || 0) + 1;
        return acc;
      }, {});

      // Hitung per prodi
      const prodiResult = filteredComplete.reduce((acc, item) => {
        let namaProdi = item?.mhs
          ? item.mhs?.prodi?.nama_prodi || "Tidak diketahui"
          : item?.dosen
            ? item.dosen?.prodi?.nama_prodi || "Tidak diketahui"
            : "Tidak diketahui";
        acc[namaProdi] = (acc[namaProdi] || 0) + 1;
        return acc;
      }, {});

      setFakultasCompleteCount(fakultasResult);
      setProdiCompleteCount(prodiResult);
    }
  }, [loading, allData]);

  const makePieConfig = (labels, data) => ({
    data: {
      labels,
      datasets: [
        {
          label: 'Selesai',
          data,
          backgroundColor: labels.map((_, i) =>
            `hsl(${(i * 40) % 360}, 70%, 60%)`
          ),
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.parsed;
              const total = context.chart._metasets[0].total;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  const fakultasLabels = Object.keys(fakultasCompleteCount);
  const fakultasValues = Object.values(fakultasCompleteCount);

  const prodiLabels = Object.keys(prodiCompleteCount);
  const prodiValues = Object.values(prodiCompleteCount);

  return (
    <div>
      <p>Total users: {allData.length}</p>

      <h2>Fakultas (Selesai)</h2>
      <div style={{ width: '500px', margin: 'auto' }}>
        {loading ? <p>Loading...</p> :
          <Chart type="pie" {...makePieConfig(fakultasLabels, fakultasValues)} />}
      </div>

      <h2>Prodi (Selesai)</h2>
      <div style={{ width: '500px', margin: 'auto' }}>
        {loading ? <p>Loading...</p> :
          <Chart type="pie" {...makePieConfig(prodiLabels, prodiValues)} />}
      </div>
    </div>
  );
}
