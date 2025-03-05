import React, { useEffect, useRef, useState } from "react";
import Layout from "../../Component/Layout";
import ErrorList from "../../Component/ErrorList";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import "bootstrap-icons/font/bootstrap-icons.css";
import { UPDATE_SUBKATEGORI_FAILURE, UPDATE_SUBKATEGORI_SUCCESS, updateSubKategori } from "./redux/actions/subkategoriActions";
import { useDispatch, useSelector } from "react-redux";
import 'react-calendar-datetime-picker/dist/style.css'

function SubKategoriForm({typeEvent = "Add", kategori=null, subkategori=null, level=null}) {
    const dispatch = useDispatch();
    const action_type = useSelector((state) => state.subkategori.action_type);
    const loading = useSelector((state) => state.subkategori.loading); // Access loading state from Redux
    const errorMessage = useSelector((state) => state.subkategori.error);
    const validation = useSelector((state) => state.subkategori.validation);

    const [nama_subkategori, setNamaSubKategori] = useState(subkategori?.nama_sub);
    
    const debounceTimeout = useRef(null);
    const closed = 3000;
    
    useEffect(()=>{
        if(action_type == UPDATE_SUBKATEGORI_SUCCESS){
            toast.success("berhasil simpan subkategori", {
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
                window.location.href = `/kategori/${kategori?.id}/sub`;
            }, closed);

            return () => clearTimeout(timer);
        }
        if(action_type == UPDATE_SUBKATEGORI_FAILURE){
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
        dispatch(updateSubKategori(subkategori.id, kategori.id, nama_subkategori));
    }

    return (
        <>
            <Layout level={level}>
                <div className="header">
                    <h1 className="header-title">
                        Sub Kategori Kuesioner
                    </h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item header-subtitle">Kategori Kuesioner</li>
                            <li className="breadcrumb-item header-subtitle"><a href={`/kategori/${kategori?.id}`}>{kategori?.nama_kategori}</a></li>
                            <li className="breadcrumb-item header-subtitle">Sub Kategori</li>
                            <li className="breadcrumb-item header-subtitle active">{typeEvent}</li>
                        </ol>
                    </nav>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card flex-fill table-responsive gap-2 px-4 py-3">
                            <div className="row gap-2">
                                <div className="form-floating">
                                    <input type="text" className="form-control" value={kategori.nama_kategori} disabled={true}/>
                                    <label htmlFor="floatingInput">Nama Kategori <b className="text-danger"></b></label>
                                </div>

                                <div className="form-floating">
                                    <input type="text" className="form-control" value={nama_subkategori} onChange={(e)=>setNamaSubKategori(e.target.value)}/>
                                    <label htmlFor="floatingInput">Nama Sub Kategori <b className="text-danger">*</b></label>
                                    <ErrorList errors={validation?.nama_sub} />
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

export default SubKategoriForm;
