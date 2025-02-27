import React, { useEffect, useRef, useState } from "react";
import Layout from "../../Component/Layout";
import ErrorList from "../../Component/ErrorList";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import "bootstrap-icons/font/bootstrap-icons.css";
import { UPDATE_PENGGUNA_FAILURE, UPDATE_PENGGUNA_SUCCESS, updatePengguna } from "./redux/actions/penggunaActions";
import { useDispatch, useSelector } from "react-redux";
import 'react-calendar-datetime-picker/dist/style.css'

const today = new Date();

function PenggunaForm({typeEvent = "Add", pengguna=null, listFakultas=[], level=null}) {
    const json = JSON.parse(pengguna?.rule ?? "{}");

    const dispatch = useDispatch();
    const action_type = useSelector((state) => state.pengguna.action_type);
    const loading = useSelector((state) => state.pengguna.loading); // Access loading state from Redux
    const errorMessage = useSelector((state) => state.pengguna.error);
    const validation = useSelector((state) => state.pengguna.validation);

    const [username, setUsername] = useState(pengguna?.username);
    const [nama, setNama] = useState(pengguna?.name);
    const [hakAkses, setHakAkses] = useState(pengguna?.level);
    const [password, setPassword] = useState(pengguna?.password);
    const [fakultas, setFakultas] = useState(pengguna?.fakultas);

    const debounceTimeout = useRef(null);
    const closed = 3000;
    
    useEffect(()=>{
        if(action_type == UPDATE_PENGGUNA_SUCCESS){
            toast.success("berhasil simpan pengguna", {
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
                window.location.href = `/pengguna`;
            }, closed);

            return () => clearTimeout(timer);
        }
        if(action_type == UPDATE_PENGGUNA_FAILURE){
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

    useEffect(()=>{
        if(hakAkses=="admin"){
            setFakultas(null);
        }
    },[hakAkses]);

    function saveHandler(){
        dispatch(updatePengguna(pengguna.id, username, nama, password, hakAkses, fakultas));
    }

    return (
        <>
            <Layout level={level}>
                <div className="header">
                    <h1 className="header-title">
                        Pengguna
                    </h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item header-subtitle"><a href="#">Pengguna</a></li>
                            <li className="breadcrumb-item header-subtitle active">{typeEvent}</li>
                        </ol>
                    </nav>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card flex-fill table-responsive gap-2 px-4 py-3">
                            <div className="row gap-2">
                                <div className="form-floating">
                                    <input type="text" className="form-control" value={username} onChange={(e)=>setUsername(e.target.value)}/>
                                    <label htmlFor="floatingInput">Username <b className="text-danger">*</b></label>
                                    <ErrorList errors={validation?.username} />
                                </div>

                                <div className="form-floating">
                                    <input type="text" className="form-control" value={nama} onChange={(e)=>setNama(e.target.value)}/>
                                    <label htmlFor="floatingInput">Nama <b className="text-danger">*</b></label>
                                    <ErrorList errors={validation?.nama} />
                                </div>

                                <div className="form-floating">
                                    <input type="text" className="form-control" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                                    <label htmlFor="floatingInput">Password</label>
                                    <small><b className="text-danger">*</b> kosongkan jika tidak ingin ubah password</small>
                                    <ErrorList errors={validation?.password} />
                                </div>
                                
                                <div className="form-floating">
                                    <select className="form-select" id="level" value={hakAkses} onChange={(e)=>setHakAkses(e.target.value)}>
                                    <option selected={hakAkses===""}></option>
                                    <option value="admin" selected={hakAkses==="admin"}>Admin</option>
                                    <option value="fakultas" selected={hakAkses==="fakultas"}>Fakultas</option>
                                    </select>
                                    <label htmlFor="level">Level <b className="text-danger">*</b></label>
                                    <ErrorList errors={validation?.level} />
                                </div>

                                <div className="form-floating">
                                    <select className="form-select" id="fakultas" value={fakultas} onChange={(e)=>setFakultas(e.target.value)}>
                                    <option selected={hakAkses===""}></option>
                                    {
                                        listFakultas.map(f => <option value={f.kode_fakultas} selected={fakultas===f.kode_fakultas}>{f.nama_fakultas}</option>)
                                    }
                                    </select>
                                    <label htmlFor="fakultas">Fakultas {hakAkses=="fakultas"? <b className="text-danger">*</b>:<></>}</label>
                                    <ErrorList errors={validation?.fakultas} />
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

export default PenggunaForm;
