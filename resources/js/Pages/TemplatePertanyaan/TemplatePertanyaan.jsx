import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Component/Layout";
import Modal from "../../Component/Modal";
import PaginationTable from "../../Component/Pagination";
import { fetchTemplatePertanyaans, deleteTemplatePertanyaan, setTemplatePertanyaans, DELETE_TEMPLATE_PERTANYAAN_SUCCESS, FETCH_TEMPLATE_PERTANYAANS_REQUEST, FETCH_TEMPLATE_PERTANYAANS_FAILURE, DELETE_TEMPLATE_PERTANYAAN_FAILURE } from "./redux/actions/templatePertanyaanActions";
import { Bounce, toast, ToastContainer } from "react-toastify";
// import { Inertia } from '@inertiajs/inertia';

function TemplatePertanyaan({bankSoal, level=null}) {
    const dispatch = useDispatch();
    const templatePertanyaans = useSelector((state) => state.templatePertanyaan.templatePertanyaans);
    const action_type = useSelector((state) => state.templatePertanyaan.action_type);
    const errorMessage = useSelector((state) => state.templatePertanyaan.error);
    const loading = useSelector((state) => state.templatePertanyaan.loading); // Access loading state from Redux

    const [isModalDeleteVisible, setModalDeleteVisible] = useState(false);    
    const [filters, setFilters] = useState({ judul: '', tipe: '', id_bank_soal: bankSoal.id});

    const debounceTimeout = useRef(null);

    useEffect(()=>{
        console.log("loading:",loading);
        console.log("action_type:",action_type);

        if(action_type==DELETE_TEMPLATE_PERTANYAAN_SUCCESS){
            setModalDeleteVisible(false);
            dispatch(fetchTemplatePertanyaans());
        }

        if(action_type==DELETE_TEMPLATE_PERTANYAAN_FAILURE || action_type==FETCH_TEMPLATE_PERTANYAANS_FAILURE ){
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
    },[loading,action_type])

    useEffect(() => {
        dispatch(fetchTemplatePertanyaans(filters));
    }, [filters]);

    function changeSelected(id) {
        const updatedTemplatePertanyaans = templatePertanyaans.record.map((item) =>
          item.id === id ? { ...item, selected: !item.selected } : item
        );
      
        dispatch(setTemplatePertanyaans(updatedTemplatePertanyaans));
        console.log("after selected", updatedTemplatePertanyaans);
        console.log((templatePertanyaans?.record ?? []).filter(item => item.selected))
    }

    function getTotalSelected() {
        return (templatePertanyaans?.record ?? []).filter(item => item.selected).length;
    }

    function getIdSelected() {
        return (templatePertanyaans?.record ?? []).filter(item => item.selected).map(item => item.id);
    }

    function onDelete() {
        setJudulModal("Anda yakin ingin hapus data?");
        setModalDeleteVisible(true);
    }

    function openTambah(id_bank_soal) {
        window.location.href = `/bankSoal/${id_bank_soal}/pertanyaan/add`;
    }

    function openEdit(id_bank_soal,id_pertanyaan) {
        window.location.href = `/bankSoal/${id_bank_soal}/pertanyaan/${id_pertanyaan}/edit`;
    }
    
    function deleteDataHandler() {
        dispatch(deleteTemplatePertanyaan(getIdSelected())); // Dispatch delete action
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
                    content={""}
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
                <Layout level={level}>
                    <div className="header">
                        <h1 className="header-title">Template Kuesioner</h1>
                        <nav>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item header-subtitle">Template Kuesioner</li>
                                <li className="breadcrumb-item header-subtitle active">{bankSoal?.judul ?? "??"}</li>
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
                                                onClick={() => openTambah(bankSoal.id)}
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
                                                Pertanyaan
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Pertanyaan"
                                                    onChange={(e) => changeFilter("pertanyaan", e.target.value)}
                                                />
                                            </th>
                                            <th>Jenis Pilihan</th>
                                            <th>Bobot</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <TemplatePertanyaan.TemplatePertanyaansBody
                                            id_bank_soal={bankSoal.id}
                                            action_type={action_type}
                                            templatePertanyaans={templatePertanyaans}
                                            loading={loading}
                                            changeSelected={changeSelected}
                                            openEdit={openEdit}
                                    />
                                </table>

                                <PaginationTable
                                    total={action_type==FETCH_TEMPLATE_PERTANYAANS_REQUEST?  "":(templatePertanyaans.total || 1)}
                                    currentPage={templatePertanyaans.currentPage}
                                    itemsPerPage={5}
                                    onPageChange={(page) => dispatch(fetchTemplatePertanyaans(filters, page))}
                                />
                            </div>
                        </div>
                    </div>

                    <ToastContainer />
                </Layout>
            </>
    );
}

TemplatePertanyaan.TemplatePertanyaansBody = ({ id_bank_soal, action_type, templatePertanyaans, loading, changeSelected, openEdit }) => {
    if (action_type === FETCH_TEMPLATE_PERTANYAANS_REQUEST) {
        return <TemplatePertanyaan.LoadingRow />;
    } else if (action_type === FETCH_TEMPLATE_PERTANYAANS_FAILURE) {
        return <TemplatePertanyaan.ErrorRow />;
    } else {
        return (
            <tbody>
                {templatePertanyaans.record?.map(item => (
                    <TemplatePertanyaan.TemplatePertanyaansRow 
                        key={item.id}
                        id_bank_soal={id_bank_soal}
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
TemplatePertanyaan.TemplatePertanyaansRow = ({ id_bank_soal, item, loading, changeSelected, openEdit }) => (
    <tr key={item.id}>
        <td>
            <input type="checkbox" checked={item.selected} onChange={() => changeSelected(item.id)} />
        </td>
        <td>{item.pertanyaan}</td>
        <td>
            <span className="badge bg-success">{item.jenis_pilihan}</span>
        </td>
        <td>
            <span className="badge bg-success">{item.bobot}</span>
        </td>
        <td>
            <div className="d-flex justify-content-center gap-2">
                <button className="btn" disabled={loading} onClick={() => openEdit(id_bank_soal, item.id)}>
                    <i className="bi bi-pencil text-black" style={{ fontSize: "1.2rem" }}></i>
                </button>
            </div>
        </td>
    </tr>
);
TemplatePertanyaan.LoadingRow = () => (
    <tr key="loading">
        <td className="text-center" colSpan={5}>Memuat data...</td>
    </tr>
);
TemplatePertanyaan.ErrorRow = () => (
    <tr key="error">
        <td className="text-center" colSpan={5}>
            <button className="btn btn-primary">Refresh</button>
        </td>
    </tr>
);

export default TemplatePertanyaan;
