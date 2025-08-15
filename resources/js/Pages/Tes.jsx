import React, { useEffect, useState } from "react";
import { Chart } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    BarController,
    LineController
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    BarController,
    LineController,
    ChartDataLabels
);

export default function Tes() {
    const [allData, setAllData] = useState([]);
    const [loadedChunks, setLoadedChunks] = useState(0);
    const [loading, setLoading] = useState(true);

    const [fakultasCompleteCount, setFakultasCompleteCount] = useState({});
    const [fakultasIncompleteCount, setFakultasIncompleteCount] = useState({});
    const [prodiCompleteCount, setProdiCompleteCount] = useState({});
    const [prodiIncompleteCount, setProdiIncompleteCount] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/tes/all");
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                let lines = buffer.split("\n");
                buffer = lines.pop();

                for (let line of lines) {
                    if (line.trim()) {
                        const chunkData = JSON.parse(line);
                        setAllData(prev => [...prev, ...chunkData]);
                        setLoadedChunks(prev => prev + 1);
                    }
                }
            }

            if (buffer.trim()) {
                const chunkData = JSON.parse(buffer);
                setAllData(prev => [...prev, ...chunkData]);
                setLoadedChunks(prev => prev + 1);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!loading && allData.length > 0) {
            const filteredComplete = allData.filter(item => item.status_pengisian === "isi lengkap");
            const filteredIncomplete = allData.filter(item => item.status_pengisian !== "isi lengkap");

            // Fakultas
            const fakultasCompleteResult = filteredComplete.reduce((acc, item) => {
                let namaFak;
                if (item?.mhs) {
                    namaFak = item.mhs?.fakultas?.nama_fakultas || "Tidak diketahui";
                } else if (item?.dosen) {
                    namaFak = item.dosen?.prodi?.fakultas?.nama_fakultas || "Tidak diketahui";
                } else {
                    namaFak = "Tidak diketahui";
                }
                acc[namaFak] = (acc[namaFak] || 0) + 1;
                return acc;
            }, {});
            const fakultasIncompleteResult = filteredIncomplete.reduce((acc, item) => {
                let namaFak;
                if (item?.mhs) {
                    namaFak = item.mhs?.fakultas?.nama_fakultas || "Tidak diketahui";
                } else if (item?.dosen) {
                    namaFak = item.dosen?.prodi?.fakultas?.nama_fakultas || "Tidak diketahui";
                } else {
                    namaFak = "Tidak diketahui";
                }
                acc[namaFak] = (acc[namaFak] || 0) + 1;
                return acc;
            }, {});

            // Prodi
            const prodiCompleteResult = filteredComplete.reduce((acc, item) => {
                let namaProdi;
                if (item?.mhs) {
                    namaProdi = item.mhs?.prodi?.nama_prodi || "Tidak diketahui";
                } else if (item?.dosen) {
                    namaProdi = item.dosen?.prodi?.nama_prodi || "Tidak diketahui";
                } else {
                    namaProdi = "Tidak diketahui";
                }
                acc[namaProdi] = (acc[namaProdi] || 0) + 1;
                return acc;
            }, {});
            const prodiIncompleteResult = filteredIncomplete.reduce((acc, item) => {
                let namaProdi;
                if (item?.mhs) {
                    namaProdi = item.mhs?.prodi?.nama_prodi || "Tidak diketahui";
                } else if (item?.dosen) {
                    namaProdi = item.dosen?.prodi?.nama_prodi || "Tidak diketahui";
                } else {
                    namaProdi = "Tidak diketahui";
                }
                acc[namaProdi] = (acc[namaProdi] || 0) + 1;
                return acc;
            }, {});

            setFakultasCompleteCount(fakultasCompleteResult);
            setFakultasIncompleteCount(fakultasIncompleteResult);
            setProdiCompleteCount(prodiCompleteResult);
            setProdiIncompleteCount(prodiIncompleteResult);
        }
    }, [loading, allData]);

    // Fungsi buat chart config
    const makeChartConfig = (labels, selesai, belum, total) => ({
        data: {
            labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Total',
                    data: total,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    type: 'line',
                    label: 'Selesai',
                    data: selesai,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    fill: false,
                    tension: 0.3
                },
                {
                    type: 'line',
                    label: 'Belum Selesai',
                    data: belum,
                    borderColor: 'rgba(255, 206, 86, 1)',
                    backgroundColor: 'rgba(255, 206, 86, 0.5)',
                    fill: false,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.parsed.y;
                            const totalForLabel = total[context.dataIndex];
                            const percentage = totalForLabel > 0 ? ((value / totalForLabel) * 100).toFixed(1) : 0;
                            return `${context.dataset.label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                datalabels: {
                    color: '#000',
                    font: { weight: 'bold' },
                    formatter: (value, context) => {
                        const totalForLabel = total[context.dataIndex];
                        const percentage = totalForLabel > 0 ? ((value / totalForLabel) * 100).toFixed(1) : 0;
                        return `${percentage}%`;
                    }
                }
            }
        }
    });

    // Fakultas data
    const fakultasLabels = Object.keys({ ...fakultasCompleteCount, ...fakultasIncompleteCount });
    const fakultasSelesai = fakultasLabels.map(label => fakultasCompleteCount[label] || 0);
    const fakultasBelum = fakultasLabels.map(label => fakultasIncompleteCount[label] || 0);
    const fakultasTotal = fakultasLabels.map((_, i) => fakultasSelesai[i] + fakultasBelum[i]);

    // Prodi data
    const prodiLabels = Object.keys({ ...prodiCompleteCount, ...prodiIncompleteCount });
    const prodiSelesai = prodiLabels.map(label => prodiCompleteCount[label] || 0);
    const prodiBelum = prodiLabels.map(label => prodiIncompleteCount[label] || 0);
    const prodiTotal = prodiLabels.map((_, i) => prodiSelesai[i] + prodiBelum[i]);

    return (
        <div>
            <p>Total users: {allData.length}</p>

            <h2>Per Fakultas</h2>
            <div style={{ width: '100%', margin: 'auto' }}>
                {   loading? 
                    <p>Loading data...</p> : 
                    <Chart type='bar' {...makeChartConfig(fakultasLabels, fakultasSelesai, fakultasBelum, fakultasTotal)} />
                }
            </div>

            <h2>Per Prodi</h2>
            <div style={{ width: '100%', margin: 'auto' }}>
                {   loading? 
                    <p>Loading data...</p> : 
                    <Chart type='bar' {...makeChartConfig(prodiLabels, prodiSelesai, prodiBelum, prodiTotal)} />
                }
            </div>
        </div>
    );
}
