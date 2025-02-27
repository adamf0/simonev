import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Component/Layout";
import Modal from "../../Component/Modal";
import PaginationTable from "../../Component/Pagination";
import { fetchPenggunas, addPengguna, deletePengguna, setPenggunas, DELETE_PENGGUNA_SUCCESS, ADD_PENGGUNA_SUCCESS, FETCH_PENGGUNAS_REQUEST, FETCH_PENGGUNAS_FAILURE, DELETE_PENGGUNA_FAILURE, ADD_PENGGUNA_FAILURE } from "./redux/actions/penggunaActions";
import { Bounce, toast, ToastContainer } from "react-toastify";
// import { Inertia } from '@inertiajs/inertia';

function Pengguna({listFakultas=[],level=null}) {
    const dispatch = useDispatch();
    
    const penggunas = useSelector((state) => state.pengguna.penggunas);
    const action_type = useSelector((state) => state.pengguna.action_type);
    const errorMessage = useSelector((state) => state.pengguna.error);
    const loading = useSelector((state) => state.pengguna.loading); // Access loading state from Redux

    const [filters, setFilters] = useState({ nama: '', level: '' });
    const [isModalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [isModalAddVisible, setModalAddVisible] = useState(false);
    const [judulModal, setJudulModal] = useState(null);
    const [username, setUsername] = useState(null);
    const [nama, setNama] = useState(null);
    const [hakAkses, setHakAkses] = useState(null);
    const [password, setPassword] = useState(null);
    const [fakultas, setFakultas] = useState(null);

    const debounceTimeout = useRef(null);

    useEffect(()=>{
        console.log("loading:",loading);
        console.log("action_type:",action_type);

        if(action_type==DELETE_PENGGUNA_SUCCESS){
            setModalDeleteVisible(false);
            dispatch(fetchPenggunas());
        }
        if(action_type==DELETE_PENGGUNA_FAILURE || action_type==ADD_PENGGUNA_FAILURE || action_type==FETCH_PENGGUNAS_FAILURE ){
            toast.error(errorMessage?.response?.data?.message, {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
        if(action_type==ADD_PENGGUNA_SUCCESS){
            setModalAddVisible(false);
            dispatch(fetchPenggunas());
        }
    },[loading,action_type])

    useEffect(() => {
        dispatch(fetchPenggunas(filters));
    }, [filters]);

    function changeSelected(id) {
        const updatedPenggunas = penggunas.record.map((item) =>
          item.id === id ? { ...item, selected: !item.selected } : item
        );
      
        dispatch(setPenggunas(updatedPenggunas));
        console.log("after selected", updatedPenggunas);
    }

    function getTotalSelected() {
        return (penggunas?.record ?? []).filter(item => item.selected).length;
    }

    function getIdSelected() {
        return (penggunas?.record ?? []).filter(item => item.selected).map(item => item.id);
    }

    function onDelete() {
        setJudulModal("Anda yakin ingin hapus data?");
        setModalDeleteVisible(true);
    }

    function openEdit(id) {
        window.location.href = `/pengguna/${id}/edit`;
    }
    
    function deleteDataHandler() {
        dispatch(deletePengguna(getIdSelected())); // Dispatch delete action
    }

    function saveDataHandler() {
        dispatch(addPengguna(username, nama, password, hakAkses, fakultas)); // Dispatch add action
    }

    // Debounced filter change
    const changeFilter = (key, value) => {
        setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
    };

    return (
            <>
                <Modal
                    isVisible={isModalDeleteVisible}
                    title="Peringatan"
                    onClose={() => setModalDeleteVisible(false)}
                    showClose={!loading}
                    content={judulModal}
                    footer={
                        <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                            type="button"
                            disabled={loading}
                            onClick={() => deleteDataHandler()}
                        >
                            {/* {loading.target === "btn-delete-modal" && loading.val && (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            )} */}
                            Ya
                        </button>
                    }
                />
                <Modal
                    isVisible={isModalAddVisible}
                    title="Tambah Data"
                    onClose={() => setModalAddVisible(false)}
                    showClose={!loading}
                    content={
                        <div className="row gap-2">
                                <div className="form-floating">
                                    <input type="text" className="form-control" value={username} onChange={(e)=>setUsername(e.target.value)}/>
                                    <label htmlFor="floatingInput">Username <b className="text-danger">*</b></label>
                                </div>

                                <div className="form-floating">
                                    <input type="text" className="form-control" value={nama} onChange={(e)=>setNama(e.target.value)}/>
                                    <label htmlFor="floatingInput">Nama <b className="text-danger">*</b></label>
                                </div>

                                <div className="form-floating">
                                    <input type="text" className="form-control" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                                    <label htmlFor="floatingInput">Password <b className="text-danger">*</b></label>
                                </div>
                                
                                <div className="form-floating">
                                    <select className="form-select" id="level" value={hakAkses} onChange={(e)=>setHakAkses(e.target.value)}>
                                    <option selected=""></option>
                                    <option value="admin" selected={hakAkses=="admin"}>Admin</option>
                                    <option value="fakultas" selected={hakAkses=="fakultas"}>Fakultas</option>
                                    </select>
                                    <label htmlFor="level">Level <b className="text-danger">*</b></label>
                                </div>

                                <div className="form-floating">
                                    <select className="form-select" id="fakultas" value={fakultas} onChange={(e)=>setFakultas(e.target.value)}>
                                    <option selected={hakAkses===""}></option>
                                    {
                                        listFakultas.map(f => <option value={f.kode_fakultas} selected={fakultas===f.kode_fakultas}>{f.nama_fakultas}</option>)
                                    }
                                    </select>
                                    <label htmlFor="fakultas">Fakultas {hakAkses=="fakultas"? <b className="text-danger">*</b>:<></>}</label>
                                </div>
                        </div>
                    }
                    footer={
                        <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                            type="button"
                            disabled={loading}
                            onClick={() => saveDataHandler()}
                        >
                            {/* {loading.target === "btn-save-modal" && loading.val && (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            )} */}
                            Simpan
                        </button>
                    }
                />

                <Layout level={level}>
                    <div className="header">
                        <h1 className="header-title">Pengguna</h1>
                        <nav>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item header-subtitle">Pengguna</li>
                            </ol>
                        </nav>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <div className="card flex-fill table-responsive gap-2 px-4 py-3">
                                <div className="card-header">
                                    <div className="d-flex flex-wrap justify-content-between gap-2">
                                        <div></div>
                                        <div className="d-flex flex-wrap justify-content-xl-end gap-2">
                                            <button
                                                disabled={loading}
                                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                                                onClick={() => setModalAddVisible(true)}
                                            >
                                                Tambah
                                            </button>
                                            { 
                                                getTotalSelected() ?  
                                                <button className="btn btn-sm btn-danger d-flex align-items-center gap-2" type="button" disabled={false} onClick={() => onDelete()}>
                                                    Hapus
                                                </button>
                                                : null
                                            }
                                        </div>
                                    </div>
                                </div>

                                <table className="table table-striped text-center">
                                    <thead>
                                        <tr>
                                            <th>
                                                
                                            </th>
                                            <th>
                                                Nama
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Nama"
                                                    onChange={(e) => changeFilter("nama", e.target.value)}
                                                />
                                            </th>
                                            <th>Username</th>
                                            <th>
                                                Level
                                                <select
                                                    className="form-select"
                                                    onChange={(e) => changeFilter("level", e.target.value)}
                                                >
                                                    <option defaultValue="" selected={true}>Semua</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="fakultas">Prodi</option>
                                                </select>
                                            </th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <Pengguna.PenggunasBody
                                            action_type={action_type}
                                            penggunas={penggunas}
                                            loading={loading}
                                            changeSelected={changeSelected}
                                            openEdit={openEdit}
                                    />
                                </table>

                                <PaginationTable
                                    total={action_type==FETCH_PENGGUNAS_REQUEST?  "":(penggunas.total || 1)}
                                    currentPage={penggunas.currentPage}
                                    itemsPerPage={5}
                                    onPageChange={(page) => dispatch(fetchPenggunas(filters, page))}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <ToastContainer />
                </Layout>
            </>
    );
}

Pengguna.PenggunasBody = ({ action_type, penggunas, loading, changeSelected, openEdit }) => {
    if (action_type === FETCH_PENGGUNAS_REQUEST) {
        return <Pengguna.LoadingRow />;
    } else if (action_type === FETCH_PENGGUNAS_FAILURE) {
        return <Pengguna.ErrorRow />;
    } else {
        return (
            <tbody>
                {penggunas.record?.map(item => (
                    <Pengguna.PenggunasRow 
                        key={item.id}
                        item={item}
                        loading={loading}
                        changeSelected={changeSelected}
                        openEdit={openEdit}
                    />
                ))}
            </tbody>
        );
    }
};
Pengguna.PenggunasRow = ({ item, loading, changeSelected, openEdit }) => { 
    return (
        <tr key={item.id}>
            <td>
                <input type="checkbox" checked={item.selected} onChange={() => changeSelected(item.id)} />
            </td>
            <td>{item.name}</td>
            <td>{item.username}</td>
            <td>{item.level}</td>
            <td>
                <div className="d-flex justify-content-center gap-2">
                    <button className="btn" disabled={loading} onClick={() => openEdit(item.id)}>
                        <i className="bi bi-pencil text-black" style={{ fontSize: "1.2rem" }}></i>
                    </button>
                </div>
            </td>
        </tr>
    );
}
Pengguna.LoadingRow = () => (
    <tr key="loading">
        <td className="text-center" colSpan={5}>Memuat data...</td>
    </tr>
);
Pengguna.ErrorRow = () => (
    <tr key="error">
        <td className="text-center" colSpan={5}>
            <button className="btn btn-primary">Refresh</button>
        </td>
    </tr>
);

export default Pengguna;
