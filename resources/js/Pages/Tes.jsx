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

  const makePieConfig = (labels, rawData) => {
    const total = rawData.reduce((sum, val) => sum + val, 0);
    const percentageData = rawData.map(val => (val / total * 100).toFixed(1)+"%");
  
    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Persentase',
            data: percentageData, // tampilkan persentase di chart
            customData: rawData,  // simpan data asli untuk tooltip
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
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const rawValue = context.dataset.customData[context.dataIndex];
                const total = context.dataset.customData.reduce((sum, v) => sum + v, 0);
                const percentage = ((rawValue / total) * 100).toFixed(1);
                return `${context.label}: ${rawValue} (${percentage}%)`;
              }
            }
          }
        },
        // Plugin untuk memberi teks kontras
        elements: {
          arc: {
            borderColor: "#fff"
          }
        }
      },
      plugins: [{
        id: 'textInCenter',
        afterDraw: chart => {
          const ctx = chart.ctx;
          chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((element, index) => {
              const value = dataset.data[index];
              ctx.fillStyle = '#fff'; // warna teks (putih)
              ctx.font = 'bold 14px Arial';
              const position = element.tooltipPosition();
              ctx.fillText(value, position.x, position.y);
            });
          });
        }
      }]
    };
  };

  const fakultasLabels = Object.keys(fakultasCompleteCount);
  const fakultasValues = Object.values(fakultasCompleteCount);
  const fakultasColors = fakultasLabels.map((_, i) =>
    `hsl(${(i * 40) % 360}, 70%, 60%)`
  );

  const prodiLabels = Object.keys(prodiCompleteCount);
  const prodiValues = Object.values(prodiCompleteCount);
  const prodiColors = prodiLabels.map((_, i) =>
    `hsl(${(i * 40) % 360}, 70%, 60%)`
    );

  return (
    <div>
      <p>Total users: {allData.length}</p>

      <h2>Fakultas (Selesai)</h2>
      <div style={{ width: '500px' }}>
                <Chart type="pie" {...makePieConfig(fakultasLabels, fakultasValues)} />
            </div>
            <div className="chart-legend">
                {fakultasLabels.map((label, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: fakultasColors[i],
                    marginRight: '6px'
                    }}></div>
                    <span>{label}</span>
                </div>
                ))}
            </div>

      <h2>Prodi (Selesai)</h2>
      <div className="chart-container">
            <div style={{ width: '500px' }}>
                <Chart type="pie" {...makePieConfig(prodiLabels, prodiValues)} />
            </div>
            <div className="chart-legend">
                {prodiLabels.map((label, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: prodiColors[i],
                    marginRight: '6px'
                    }}></div>
                    <span>{label}</span>
                </div>
                ))}
            </div>
        </div>
    </div>
  );
}
