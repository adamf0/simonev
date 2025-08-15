import React, { useEffect, useState } from "react";
import { Head, usePage } from "@inertiajs/react";

export default function Tes() {
    const [allUsers, setAllUsers] = useState([]);
    const [loadedChunks, setLoadedChunks] = useState(0);
    const [loading, setLoading] = useState(true);
    const [fakultasCount, setFakultasCount] = useState({});
    const [prodiCount, setProdiCount] = useState({});

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

                // Simpan baris terakhir (mungkin belum lengkap) di buffer
                buffer = lines.pop();

                // Proses setiap baris lengkap
                for (let line of lines) {
                    if (line.trim()) {
                        const chunkData = JSON.parse(line);
                        setAllUsers(prev => [...prev, ...chunkData]);
                        setLoadedChunks(prev => prev + 1);
                    }
                }
            }

            // Jika masih ada sisa data di buffer
            if (buffer.trim()) {
                const chunkData = JSON.parse(buffer);
                setAllUsers(prev => [...prev, ...chunkData]);
                setLoadedChunks(prev => prev + 1);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!loading && allUsers.length > 0) {
            console.log("✅ Semua data sudah lengkap:", allUsers);

            // Hitung total per fakultas
            const fakultasResult = allUsers.reduce((acc, item) => {
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

            // Hitung total per prodi
            const prodiResult = allUsers.reduce((acc, item) => {
                let namaProdi;

                if (item?.mhs && item?.dosen) {
                    namaProdi = "Invalid Data";
                } else if (item?.mhs) {
                    namaProdi = item?.mhs?.prodi?.nama_prodi_jenjang || "Tidak diketahui";
                } else if (item?.dosen) {
                    namaProdi = item?.dosen?.prodi?.nama_prodi_jenjang || "Tidak diketahui";
                } else {
                    namaProdi = "Tidak diketahui";
                }

                acc[namaProdi] = (acc[namaProdi] || 0) + 1;
                return acc;
            }, {});

            console.log("📊 Total per Fakultas:", fakultasResult);
            console.log("📊 Total per Prodi:", prodiResult);

            setFakultasCount(fakultasResult);
            setProdiCount(prodiResult);
        }
    }, [loading, allUsers]);

    return (
        <div>
            <h1>Users</h1>
            {loading && <p>Loading data...</p>}
            <p>Loaded chunks: {loadedChunks}</p>
            <p>Total users: {allUsers.length}</p>

            <h2>📊 Total Per Fakultas</h2>
            <ul>
                {Object.entries(fakultasCount).map(([nama, jumlah]) => (
                    <li key={nama}>{nama}: {jumlah}</li>
                ))}
            </ul>

            <h2>📊 Total Per Prodi</h2>
            <ul>
                {Object.entries(prodiCount).map(([nama, jumlah]) => (
                    <li key={nama}>{nama}: {jumlah}</li>
                ))}
            </ul>
        </div>
    );
}