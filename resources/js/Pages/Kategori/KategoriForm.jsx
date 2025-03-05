import React, { useEffect, useRef, useState } from "react";
import Layout from "../../Component/Layout";
import ErrorList from "../../Component/ErrorList";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import "bootstrap-icons/font/bootstrap-icons.css";
import { UPDATE_KATEGORI_FAILURE, UPDATE_KATEGORI_SUCCESS, updateKategori } from "./redux/actions/kategoriActions";
import { useDispatch, useSelector } from "react-redux";
import 'react-calendar-datetime-picker/dist/style.css'

function KategoriForm({typeEvent = "Add", kategori=null, level=null}) {
    const dispatch = useDispatch();
    const action_type = useSelector((state) => state.kategori.action_type);
    const loading = useSelector((state) => state.kategori.loading); // Access loading state from Redux
    const errorMessage = useSelector((state) => state.kategori.error);
    const validation = useSelector((state) => state.kategori.validation);

    const [nama_kategori, setNamaKategori] = useState(kategori?.nama_kategori);
    
    const debounceTimeout = useRef(null);
    const closed = 3000;
    
    useEffect(()=>{
        if(action_type == UPDATE_KATEGORI_SUCCESS){
            toast.success("berhasil simpan kategori", {
                position: "bottom-right",
                autoClose: closed,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });

            const timer = setTimeout(() => {
                window.location.href = `/kategori`;
            }, closed);

            return () => clearTimeout(timer);
        }
        if(action_type == UPDATE_KATEGORI_FAILURE){
            toast.error(errorMessage?.response?.data?.message, {
                position: "bottom-right",
                autoClose: closed,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    },[action_type])

    function saveHandler(){
        dispatch(updateKategori(kategori.id, nama_kategori));
    }

    return (
        <>
            <Layout level={level}>
                <div className="header">
                    <h1 className="header-title">
                        Kategori Kuesioner
                    </h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item header-subtitle"><a href="#">Kategori Kuesioner</a></li>
                            <li className="breadcrumb-item header-subtitle active">{typeEvent}</li>
                        </ol>
                    </nav>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card flex-fill table-responsive gap-2 px-4 py-3">
                            <div className="row gap-2">
                                <div className="form-floating">
                                    <input type="text" className="form-control" value={nama_kategori} onChange={(e)=>setNamaKategori(e.target.value)}/>
                                    <label htmlFor="floatingInput">Nama Kategori <b className="text-danger">*</b></label>
                                    <ErrorList errors={validation?.nama_kategori} />
                                </div>

                                <div>
                                    <button className="btn btn-outline-primary d-flex align-items-center gap-2" type="button" onClick={()=>saveHandler()} disabled={loading}>
                                        {loading? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>:<></>}
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <ToastContainer />
            </Layout>
        </>
    );
}

export default KategoriForm;
