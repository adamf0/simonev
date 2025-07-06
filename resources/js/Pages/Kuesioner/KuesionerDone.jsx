import React from "react";
import Layout from "../../Component/Layout";

function Kuesioner() {
    return (
            <>
                <Layout level={null} showNav={false}>
                    <div className="row">
                        <div className="col-12">
                            <div className="card flex-fill align-items-center gap-2 px-4 py-3">
                                <img style={{ "clip-path": "inset(0% 0% 10% 0%)", "max-width": "400px" }} src="https://ardonstatistika.com/wp-content/uploads/2022/10/36-Simak-Pengertian-dan-Cara-Membuat-Kuesioner-Kualitatif-2-1024x675.jpg" alt="kuesioner selesai" />
                                <h3 className="text-center">Kuesioner telah selesai tersimpan</h3>
                            </div>
                        </div>
                    </div>
                </Layout>
            </>
    );
}

export default Kuesioner;
