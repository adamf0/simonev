import React, { useEffect, useState } from "react";
import { Head, usePage } from "@inertiajs/react";

export default function Tes() {
    const [allUsers, setAllUsers] = useState([]);
    const [loadedChunks, setLoadedChunks] = useState(0);
    const [loading, setLoading] = useState(true);

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
        }
    }, [loading, allUsers]);

    return (
        <div>
            <h1>Users</h1>
            {loading && <p>Loading data...</p>}
            <p>Loaded chunks: {loadedChunks}</p>
            <p>Total users: {allUsers.length}</p>

            <ul>
                {allUsers.map(user => (
                    <li key={user.id}>
                        {user.status_pengisian}
                    </li>
                ))}
            </ul>
        </div>
    );
}