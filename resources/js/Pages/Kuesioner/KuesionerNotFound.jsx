import React from "react";
import Layout from "../../Component/Layout";

function KuesionerNotFound() {
    return (
            <>
                <Layout level={null} showNav={false}>
                    <div className="row">
                        <div className="col-12">
                            <div className="card flex-fill align-items-center gap-2 px-4 py-3">
                                <img style={{ "max-width": "400px", "aspec-ratio":"1/1" }} src="https://png.pngtree.com/png-vector/20200313/ourmid/pngtree-error-page-not-found-concept-with-people-having-problems-with-website-png-image_2157909.jpg" alt="kuesioner selesai" />
                                <h3 className="text-center">Kuesioner tidak ditemukan</h3>
                            </div>
                        </div>
                    </div>
                </Layout>
            </>
    );
}

export default KuesionerNotFound;
