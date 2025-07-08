import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Component/Layout";
import Modal from "../../Component/Modal";
import PaginationTable from "../../Component/Pagination";
import { fetchKategoris, addKategori, deleteKategori, setKategoris, DELETE_KATEGORI_SUCCESS, ADD_KATEGORI_SUCCESS, FETCH_KATEGORIS_REQUEST, FETCH_KATEGORIS_FAILURE, DELETE_KATEGORI_FAILURE, ADD_KATEGORI_FAILURE } from "./redux/actions/kategoriActions";
import { Bounce, toast, ToastContainer } from "react-toastify";
// import { Inertia } from '@inertiajs/inertia';

function Kategori({level=null,fakultas=null}) {
    const dispatch = useDispatch();
    
    const kategoris = useSelector((state) => state.kategori.kategoris);
    const action_type = useSelector((state) => state.kategori.action_type);
    const errorMessage = useSelector((state) => state.kategori.error);
    const loading = useSelector((state) => state.kategori.loading); // Access loading state from Redux

    const [filters, setFilters] = useState({ nama_kategori: '', level: '' });
    const [isModalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [isModalAddVisible, setModalAddVisible] = useState(false);
    const [nama_kategori, setNamaKategori] = useState(null);

    const debounceTimeout = useRef(null);

    useEffect(()=>{
        console.log("loading:",loading);
        console.log("action_type:",action_type);

        if(action_type==DELETE_KATEGORI_SUCCESS){
            setModalDeleteVisible(false);
            dispatch(fetchKategoris());
        }
        if(action_type==DELETE_KATEGORI_FAILURE || action_type==ADD_KATEGORI_FAILURE || action_type==FETCH_KATEGORIS_FAILURE ){
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
        if(action_type==ADD_KATEGORI_SUCCESS){
            setModalAddVisible(false);
            dispatch(fetchKategoris());
        }
    },[loading,action_type])

    useEffect(() => {
        dispatch(fetchKategoris(filters));
    }, [filters]);

    function changeSelected(id) {
        const updatedKategoris = kategoris.record.map((item) =>
          item.id === id ? { ...item, selected: !item.selected } : item
        );
      
        dispatch(setKategoris(updatedKategoris));
        console.log("after selected", updatedKategoris);
    }

    function getTotalSelected() {
        return (kategoris?.record ?? []).filter(item => item.selected).length;
    }

    function getIdSelected() {
        return (kategoris?.record ?? []).filter(item => item.selected).map(item => item.id);
    }

    function onDelete() {
        setModalDeleteVisible(true);
    }

    function openEdit(id) {
        window.location.href = `/kategori/${id}/edit`;
    }
    function openSub(id) {
        window.location.href = `/kategori/${id}/sub`;
    }

    function deleteDataHandler() {
        dispatch(deleteKategori(getIdSelected())); // Dispatch delete action
    }

    function saveDataHandler() {
        dispatch(addKategori(nama_kategori,fakultas)); // Dispatch add action
    }

    // Debounced filter change
    const changeFilter = useCallback((key, value) => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    
        debounceTimeout.current = setTimeout(() => {
            setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
        }, 1500);
    }, []);

    return (
            <>
                <Modal
                    isVisible={isModalDeleteVisible}
                    title="Peringatan"
                    onClose={() => setModalDeleteVisible(false)}
                    showClose={!loading}
                    content={"Anda yakin ingin hapu data ini?"}
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
                                    <input type="text" className="form-control" value={nama_kategori} onChange={(e)=>setNamaKategori(e.target.value)}/>
                                    <label htmlFor="floatingInput">Nama Kategori <b className="text-danger">*</b></label>
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
                        <h1 className="header-title">Kategori Kuesioner</h1>
                        <nav>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item header-subtitle">Kategori Kuesioner</li>
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
                                                Nama Kategori
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Nama"
                                                    onChange={(e) => changeFilter("nama_kategori", e.target.value)}
                                                />
                                            </th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <Kategori.KategorisBody
                                            action_type={action_type}
                                            kategoris={kategoris}
                                            loading={loading}
                                            changeSelected={changeSelected}
                                            openEdit={openEdit}
                                            openSub={openSub}
                                            level={level}
                                            fakultas={fakultas}
                                    />
                                </table>

                                <PaginationTable
                                    total={action_type==FETCH_KATEGORIS_REQUEST?  "":(kategoris.total || 1)}
                                    currentPage={kategoris.currentPage}
                                    itemsPerPage={5}
                                    onPageChange={(page) => dispatch(fetchKategoris(filters, page))}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <ToastContainer />
                </Layout>
            </>
    );
}

Kategori.KategorisBody = ({ action_type, kategoris, loading, changeSelected, openEdit, openSub, level, fakultas }) => {
    if (action_type === FETCH_KATEGORIS_REQUEST) {
        return <Kategori.LoadingRow />;
    } else if (action_type === FETCH_KATEGORIS_FAILURE) {
        return <Kategori.ErrorRow />;
    } else {
        return (
            <tbody>
                {kategoris.record?.map(item => (
                    <Kategori.KategorisRow 
                        key={item.id}
                        item={item}
                        loading={loading}
                        changeSelected={changeSelected}
                        openEdit={openEdit}
                        openSub={openSub}
                        level={level}
                        createdBy={item.createdBy}
                        fakultas={fakultas}
                    />
                ))}
            </tbody>
        );
    }
};
Kategori.KategorisRow = ({ item, loading, changeSelected, openEdit, openSub, level, createdBy, fakultas }) => { 
    if(createdBy!=null && (level!="admin" && createdBy!==fakultas)){
        return;
    }
    return (
        <tr key={item.id}>
            <td>
                {
                    (createdBy===fakultas || level==="admin") && 
                    <input type="checkbox" checked={item.selected} onChange={() => changeSelected(item.id)} />
                }
            </td>
            <td>
                {item.nama_kategori} &nbsp;
                {
                    createdBy!==fakultas &&
                    <span className="badge bg-success">
                        {createdBy}
                    </span>
                }
            </td>
            <td>
                {
                    (createdBy===fakultas || level==="admin") && 
                    <div className="d-flex justify-content-center gap-2">
                        <button className="btn" disabled={loading} onClick={() => openEdit(item.id)}>
                            <i className="bi bi-pencil text-black" style={{ fontSize: "1.2rem" }}></i>
                        </button>
                        <button className="btn" disabled={loading} onClick={() => openSub(item.id)}>
                            <i className="bi bi-arrow-right text-black" style={{ fontSize: "1.2rem" }}></i>
                        </button>
                    </div>
                }
            </td>
        </tr>
    );
}
Kategori.LoadingRow = () => (
    <tr key="loading">
        <td className="text-center" colSpan={5}>Memuat data...</td>
    </tr>
);
Kategori.ErrorRow = () => (
    <tr key="error">
        <td className="text-center" colSpan={5}>
            <button className="btn btn-primary">Refresh</button>
        </td>
    </tr>
);

export default Kategori;
