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

            const fakultasCompleteResult = filteredComplete.reduce((acc, item) => {
                let namaFak;
                if (item?.mhs && item?.dosen) {
                    namaFak = "Invalid Data";
                } else if (item?.mhs) {
                    namaFak = item?.mhs?.fakultas?.nama_fakultas || "Tidak diketahui";
                } else if (item?.dosen) {
                    namaFak = item?.dosen?.prodi?.fakultas?.nama_fakultas || "Tidak diketahui";
                } else {
                    namaFak = "Tidak diketahui";
                }
                acc[namaFak] = (acc[namaFak] || 0) + 1;
                return acc;
            }, {});

            const fakultasIncompleteResult = filteredIncomplete.reduce((acc, item) => {
                let namaFak;
                if (item?.mhs && item?.dosen) {
                    namaFak = "Invalid Data";
                } else if (item?.mhs) {
                    namaFak = item?.mhs?.fakultas?.nama_fakultas || "Tidak diketahui";
                } else if (item?.dosen) {
                    namaFak = item?.dosen?.prodi?.fakultas?.nama_fakultas || "Tidak diketahui";
                } else {
                    namaFak = "Tidak diketahui";
                }
                acc[namaFak] = (acc[namaFak] || 0) + 1;
                return acc;
            }, {});

            setFakultasCompleteCount(fakultasCompleteResult);
            setFakultasIncompleteCount(fakultasIncompleteResult);
        }
    }, [loading, allData]);

    const labels = Object.keys({
        ...fakultasCompleteCount,
        ...fakultasIncompleteCount
    });

    const selesai = labels.map(label => fakultasCompleteCount[label] || 0);
    const belum = labels.map(label => fakultasIncompleteCount[label] || 0);
    const total = labels.map((label, i) => selesai[i] + belum[i]);

    const chartData = {
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
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const datasetIndex = context.datasetIndex;
                        const value = context.parsed.y;
                        const totalForLabel = total[context.dataIndex];
                        const percentage = totalForLabel > 0 ? ((value / totalForLabel) * 100).toFixed(1) : 0;
                        return `${context.dataset.label}: ${value} (${percentage}%)`;
                    }
                }
            },
            datalabels: {
                color: '#000',
                font: {
                    weight: 'bold'
                },
                formatter: (value, context) => {
                    const totalForLabel = total[context.dataIndex];
                    const percentage = totalForLabel > 0 ? ((value / totalForLabel) * 100).toFixed(1) : 0;
                    return `${percentage}%`;
                }
            }
        }
    };

    return (
        <div>
            {/* <h1>Users</h1> */}
            {/* <p>Loaded chunks: {loadedChunks}</p>
            <p>Total users: {allData.length}</p> */}

            <div style={{ width: '100%', maxWidth: '900px', margin: 'auto' }}>
                {   loading? 
                    <p>Loading data...</p> : 
                    <Chart type='bar' data={chartData} options={chartOptions} />
                }
            </div>
        </div>
    );
}
