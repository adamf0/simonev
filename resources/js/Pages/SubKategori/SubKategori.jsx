import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Component/Layout";
import Modal from "../../Component/Modal";
import PaginationTable from "../../Component/Pagination";
import { fetchSubKategoris, addSubKategori, deleteSubKategori, setSubKategoris, DELETE_SUBKATEGORI_SUCCESS, ADD_SUBKATEGORI_SUCCESS, FETCH_SUBKATEGORIS_REQUEST, FETCH_SUBKATEGORIS_FAILURE, DELETE_SUBKATEGORI_FAILURE, ADD_SUBKATEGORI_FAILURE } from "./redux/actions/subkategoriActions";
import { Bounce, toast, ToastContainer } from "react-toastify";
// import { Inertia } from '@inertiajs/inertia';

function SubKategori({kategori=null, level=null, fakultas=null}) {
    const dispatch = useDispatch();

    const st = useSelector((state) => state.subkategori);
    console.log(st);
    const subkategoris = useSelector((state) => state.subkategori.subkategoris);
    const action_type = useSelector((state) => state.subkategori.action_type);
    const errorMessage = useSelector((state) => state.subkategori.error);
    const loading = useSelector((state) => state.subkategori.loading); // Access loading state from Redux

    const [filters, setFilters] = useState({ nama_kategori: '', level: '', id_kategori:kategori?.id });
    const [isModalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [isModalAddVisible, setModalAddVisible] = useState(false);
    const [nama_kategori, setNamaSubKategori] = useState(null);

    const debounceTimeout = useRef(null);

    useEffect(()=>{
        console.log("loading:",loading);
        console.log("action_type:",action_type);

        if(action_type==DELETE_SUBKATEGORI_SUCCESS){
            setModalDeleteVisible(false);
            dispatch(fetchSubKategoris({id_kategori:kategori?.id}, 1));
        }
        if(action_type==DELETE_SUBKATEGORI_FAILURE || action_type==ADD_SUBKATEGORI_FAILURE || action_type==FETCH_SUBKATEGORIS_FAILURE ){
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
        if(action_type==ADD_SUBKATEGORI_SUCCESS){
            console.log("ADD_SUBKATEGORI_SUCCESS execute")
            setModalAddVisible(false);
            dispatch(fetchSubKategoris({id_kategori:kategori?.id}, 1));
        }
    },[loading,action_type])

    useEffect(() => {
        dispatch(fetchSubKategoris(filters));
    }, [filters]);

    function changeSelected(id) {
        const updatedSubKategoris = subkategoris.record.map((item) =>
          item.id === id ? { ...item, selected: !item.selected } : item
        );
      
        dispatch(setSubKategoris(updatedSubKategoris));
        console.log("after selected", updatedSubKategoris);
    }

    function getTotalSelected() {
        return (subkategoris?.record ?? []).filter(item => item.selected).length;
    }

    function getIdSelected() {
        return (subkategoris?.record ?? []).filter(item => item.selected).map(item => item.id);
    }

    function onDelete() {
        setModalDeleteVisible(true);
    }

    function openEdit(id) {
        window.location.href = `/kategori/${kategori?.id}/sub/${id}/edit`;
    }

    function deleteDataHandler() {
        dispatch(deleteSubKategori(getIdSelected())); // Dispatch delete action
    }

    function saveDataHandler() {
        dispatch(addSubKategori(kategori?.id, nama_kategori, fakultas)); // Dispatch add action
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
                                    <input type="text" className="form-control" value={nama_kategori} onChange={(e)=>setNamaSubKategori(e.target.value)}/>
                                    <label htmlFor="floatingInput">Nama SubKategori <b className="text-danger">*</b></label>
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
                        <h1 className="header-title">Sub Kategori Kuesioner</h1>
                        <nav>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item header-subtitle">Kategori Kuesioner</li>
                                <li className="breadcrumb-item header-subtitle">{kategori?.nama_kategori}</li>
                                <li className="breadcrumb-item header-subtitle">Sub Kategori</li>
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
                                                Nama Sub Kategori
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Nama"
                                                    onChange={(e) => changeFilter("nama_sub", e.target.value)}
                                                />
                                            </th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <SubKategori.SubKategorisBody
                                            action_type={action_type}
                                            subkategoris={subkategoris}
                                            loading={loading}
                                            changeSelected={changeSelected}
                                            openEdit={openEdit}
                                            fakultas={fakultas}
                                            level={level}
                                    />
                                </table>

                                <PaginationTable
                                    total={action_type==FETCH_SUBKATEGORIS_REQUEST?  "":(subkategoris.total || 1)}
                                    currentPage={subkategoris.currentPage}
                                    itemsPerPage={5}
                                    onPageChange={(page) => dispatch(fetchSubKategoris(filters, page))}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <ToastContainer />
                </Layout>
            </>
    );
}

SubKategori.SubKategorisBody = ({ action_type, subkategoris, loading, changeSelected, openEdit, level, fakultas }) => {
    if (action_type === FETCH_SUBKATEGORIS_REQUEST) {
        return <SubKategori.LoadingRow />;
    } else if (action_type === FETCH_SUBKATEGORIS_FAILURE) {
        return <SubKategori.ErrorRow />;
    } else {
        return (
            <tbody>
                {subkategoris.record?.map(item => (
                    <SubKategori.SubKategorisRow 
                        key={item.id}
                        item={item}
                        loading={loading}
                        changeSelected={changeSelected}
                        openEdit={openEdit}
                        createdBy={item.createdBy}
                        fakultas={fakultas}
                        level={level}
                    />
                ))}
            </tbody>
        );
    }
};
SubKategori.SubKategorisRow = ({ item, loading, changeSelected, openEdit, createdBy, level, fakultas }) => { 
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
                {item.nama_sub} &nbsp;
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
                    </div>
                }
            </td>
        </tr>
    );
}
SubKategori.LoadingRow = () => (
    <tr key="loading">
        <td className="text-center" colSpan={5}>Memuat data...</td>
    </tr>
);
SubKategori.ErrorRow = () => (
    <tr key="error">
        <td className="text-center" colSpan={5}>
            <button className="btn btn-primary">Refresh</button>
        </td>
    </tr>
);

export default SubKategori;
