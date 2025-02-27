import React, { useEffect, useState } from "react";
import Layout from "../Component/Layout";

function Dashboard({level=null}) {
    console.log(level)
    return (
        <>
            <Layout level={level}>
                <div className="header">
                    <h1 className="header-title">
                        Welcome back to SIMONEV!
                    </h1>
                    <p className="header-subtitle">Aplikasi Untuk Sinkronisasi data ke Neo-Feeder</p>
                </div>

            </Layout>
        </>
    );
}

export default Dashboard;
