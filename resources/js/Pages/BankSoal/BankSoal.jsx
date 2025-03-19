import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Component/Layout";
import Modal from "../../Component/Modal";
import PaginationTable from "../../Component/Pagination";
import { fetchBankSoals, addBankSoal, deleteBankSoal, changeStatus, setBankSoals, COPY_BANK_SOAL_FAILURE, COPY_BANK_SOAL_SUCCESS, DELETE_BANK_SOAL_SUCCESS, ADD_BANK_SOAL_SUCCESS, FETCH_BANK_SOALS_REQUEST, FETCH_BANK_SOALS_FAILURE, DELETE_BANK_SOAL_FAILURE, ADD_BANK_SOAL_FAILURE, copyBankSoal, branchBankSoal } from "./redux/actions/bankSoalActions";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
// import { Inertia } from '@inertiajs/inertia';

function BankSoal({level=null, listUnit=[], listFakultas=[], listProdi=[], listMahahsiswa=[]}) {
    const dispatch = useDispatch();
    const bankSoals = useSelector((state) => state.bankSoal.bankSoals);
    const action_type = useSelector((state) => state.bankSoal.action_type);
    const errorMessage = useSelector((state) => state.bankSoal.error);
    const loading = useSelector((state) => state.bankSoal.loading); // Access loading state from Redux

    const [filters, setFilters] = useState({ judul: '', status: '', deskripsi: '', start_date: '', end_date: '' });
    const [isModalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [isModalAddVisible, setModalAddVisible] = useState(false);
    const [isModalCopyVisible, setModalCopyVisible] = useState(false);
    const [isModalBranchVisible, setModalBranchVisible] = useState(false);
    const [judulModal, setJudulModal] = useState(null);
    const [judul, setJudul] = useState(null);
    const [copyJudul, setCopyJudul] = useState(null);
    const [copyId, setCopyId] = useState(null);
    const [list, setList] = useState([]);

    const debounceTimeout = useRef(null);

    useEffect(()=>{
        console.log("loading:",loading);
        console.log("action_type:",action_type);

        if(action_type==DELETE_BANK_SOAL_SUCCESS){
            setModalDeleteVisible(false);
            dispatch(fetchBankSoals());
        }
        if(action_type==DELETE_BANK_SOAL_FAILURE || action_type==ADD_BANK_SOAL_FAILURE || action_type==COPY_BANK_SOAL_FAILURE || action_type==FETCH_BANK_SOALS_FAILURE ){
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
        if(action_type==ADD_BANK_SOAL_SUCCESS){
            setModalAddVisible(false);
            dispatch(fetchBankSoals());
        }
        if(action_type==COPY_BANK_SOAL_SUCCESS){
            setModalCopyVisible(false);
            setJudul(null);
            setCopyJudul(null);
            dispatch(fetchBankSoals());
        }
    },[loading,action_type])

    useEffect(() => {
        dispatch(fetchBankSoals(filters));
    }, [filters]);

    function changeSelected(id) {
        const updatedBankSoals = bankSoals.record.map((item) =>
          item.id === id ? { ...item, selected: !item.selected } : item
        );
      
        dispatch(setBankSoals(updatedBankSoals));
        console.log("after selected", updatedBankSoals);
    }

    function getTotalSelected() {
        return (bankSoals?.record ?? []).filter(item => item.selected).length;
    }

    function getIdSelected() {
        return (bankSoals?.record ?? []).filter(item => item.selected).map(item => item.id);
    }

    function onDelete() {
        setJudulModal("Anda yakin ingin hapus data?");
        setModalDeleteVisible(true);
    }

    function openEdit(id) {
        window.location.href = `/bankSoal/${id}/edit`;
    }
    
    function openPertanyaan(id) {
        window.location.href = `/bankSoal/${id}/pertanyaan`;
    }

    function previewPertanyaan(id) {
        window.location.href = `/bankSoal/${id}/preview`;
    }

    function openCopy(id, judul) {
        setJudul(judul);
        setCopyJudul(judul);
        setCopyId(id);
        setModalCopyVisible(true);
    }

    function createBranchHandler(id) {
        setModalBranchVisible(true);
        setCopyId(id);
    }

    function copyHandler(){
        dispatch(copyBankSoal(copyId, copyJudul));
    }

    function deleteDataHandler() {
        dispatch(deleteBankSoal(getIdSelected())); // Dispatch delete action
    }

    function saveDataHandler() {
        dispatch(addBankSoal(judul)); // Dispatch add action
    }

    function changeStatusHandler(id, status) {
        dispatch(changeStatus(id, status)); // Dispatch change status action
    }

    function branchHandler(){
        dispatch(branchBankSoal(copyId, list, level));
    }

    function renderOptionListTarget(level) {
        console.log("renderOptionListTarget")
        return useMemo(() => {
            if (level === "fakultas") {
                return listProdi.map(item => (
                    <option selected={list.includes(item.id)} key={uuidv4()} value={item.id}>{item.id} - {item.nama}</option>
                ));
            }
            return <></>;
        }, [listMahahsiswa, listUnit, listProdi]);
    }

    function handleListSelectChange(e) {
        const selectedOption = e.target.value;
    
        setList(prevList => {
            if (prevList.includes(selectedOption)) {
                return prevList.filter(item => item !== selectedOption);
            } else {
                return [...prevList, selectedOption];
            }
        });
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
                                <input
                                    type="text"
                                    className="form-control"
                                    onChange={(e) => setJudul(e.target.value)}
                                />
                                <label>Judul <b className="text-danger">*</b></label>
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
                <Modal
                    isVisible={isModalCopyVisible}
                    title="Copy Data"
                    onClose={() => {
                        setModalCopyVisible(false)
                        setJudul(null)
                        setCopyJudul(null)
                    }}
                    showClose={!loading}
                    content={
                        <div className="row gap-2">
                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={judul}
                                    disabled={true}
                                />
                                <label>Judul</label>
                            </div>
                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={copyJudul}
                                    onChange={(e) => setCopyJudul(e.target.value)}
                                />
                                <label>Judul Baru<b className="text-danger">*</b></label>
                            </div>
                        </div>
                    }
                    footer={
                        <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                            type="button"
                            disabled={loading}
                            onClick={() => copyHandler()}
                        >
                            {/* {loading.target === "btn-save-modal" && loading.val && (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            )} */}
                            Simpan
                        </button>
                    }
                />
                <Modal
                    isVisible={isModalBranchVisible}
                    title="Branch"
                    onClose={() => {
                        setModalBranchVisible(false)
                        setProdi([])
                        setCopyId(null);
                    }}
                    showClose={!loading}
                    content={
                        <div className="row gap-2">
                            <div className="form-floating">
                                <select className="form-select form-select-default" id="listSelect" value={list} onChange={(e)=>handleListSelectChange(e)} multiple>
                                <option value="" selected={list.includes("")}></option>
                                {renderOptionListTarget(level)}
                                </select>
                                <label htmlFor="listSelect">List Target <b className="text-danger">*</b></label>
                            </div>
                        </div>
                    }
                    footer={
                        <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                            type="button"
                            disabled={loading}
                            onClick={() => branchHandler()}
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
                        <h1 className="header-title">Template Kuesioner</h1>
                        <nav>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item header-subtitle">Template Kuesioner</li>
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
                                                Judul
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Judul"
                                                    onChange={(e) => changeFilter("judul", e.target.value)}
                                                />
                                            </th>
                                            <th className="d-none d-xl-table-cell">Deskripsi</th>
                                            <th>Aturan</th>
                                            <th>
                                                Status
                                                <select
                                                    className="form-select"
                                                    onChange={(e) => changeFilter("status", e.target.value)}
                                                >
                                                    <option defaultValue="" selected={true}>Semua</option>
                                                    <option value="active">Aktif</option>
                                                    <option value="non-active">Tidak Aktif</option>
                                                </select>
                                            </th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <BankSoal.BankSoalsBody
                                            level={level}
                                            action_type={action_type}
                                            bankSoals={bankSoals}
                                            loading={loading}
                                            changeSelected={changeSelected}
                                            openEdit={openEdit}
                                            changeStatusHandler={changeStatusHandler}
                                            openPertanyaan={openPertanyaan}
                                            openCopy={openCopy}
                                            previewPertanyaan={previewPertanyaan}
                                            createBranch={createBranchHandler}
                                    />
                                </table>

                                <PaginationTable
                                    total={action_type==FETCH_BANK_SOALS_REQUEST?  "":(bankSoals.total || 1)}
                                    currentPage={bankSoals.currentPage}
                                    itemsPerPage={5}
                                    onPageChange={(page) => dispatch(fetchBankSoals(filters, page))}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <ToastContainer />
                </Layout>
            </>
    );
}

BankSoal.BankSoalsBody = ({ level, action_type, bankSoals, loading, changeSelected, openEdit, changeStatusHandler, openPertanyaan, openCopy, previewPertanyaan, createBranch }) => {
    if (action_type === FETCH_BANK_SOALS_REQUEST) {
        return <BankSoal.LoadingRow />;
    } else if (action_type === FETCH_BANK_SOALS_FAILURE) {
        return <BankSoal.ErrorRow />;
    } else {
        return (
            <tbody>
                {bankSoals.record?.map(item => (
                    <BankSoal.BankSoalsRow 
                        key={item.id}
                        level={level}
                        item={item}
                        loading={loading}
                        changeSelected={changeSelected}
                        openEdit={openEdit}
                        changeStatusHandler={changeStatusHandler}
                        openPertanyaan={openPertanyaan}
                        openCopy={openCopy}
                        previewPertanyaan={previewPertanyaan}
                        createBranch={createBranch}
                    />
                ))}
            </tbody>
        );
    }
};
BankSoal.BankSoalsRow = ({ level, item, loading, changeSelected, openEdit, changeStatusHandler, openPertanyaan, openCopy, previewPertanyaan, createBranch }) => { 
    function renderAturan(item){
        let output = [<span class="badge bg-secondary">{item.peruntukan}</span>];
        if(item.rule!=null || rule!="" || rule!="{}" || rule!=undefined){
            if(item.rule?.type=="spesific"){
                output.push(<span class="badge bg-primary">Target | {item.rule?.target_type}</span>);
                item.rule?.target_list.map(row => output.push(<span class="badge bg-primary">{row}</span>));
            } else if(item.rule?.type=="all"){
                output.push(<span class="badge bg-primary">Build | Semua Target</span>);
            }

            if(item.rule?.generate?.type=="once" || item.rule?.generate?.type=="recursive"){
                output.push(<span class="badge bg-info">Build | {item.rule?.generate?.type}</span>);
                output.push(<span class="badge bg-success">Start | {item.rule?.generate?.start}</span>);
                output.push(<span class="badge bg-danger">End | {item.rule?.generate?.end}</span>);
            }
        } else{
            output.push(<span class="badge bg-light text-black">Tidak ada aturan khusus</span>)
        }
        
        return [...output];
    }
    return (
        <tr key={item.id}>
            <td>
                {
                    (level=="admin" || item.branch!=0) && <input type="checkbox" checked={item.selected} onChange={() => changeSelected(item.id)} />
                }
            </td>
            <td>{item.judul}</td>
            <td className="d-none d-xl-table-cell">{item.deskripsi}</td>
            <td width={120}>
                <div className="d-flex gap-2 flex-wrap w-50">
                {renderAturan(item)}
                </div>
            </td>
            <td>
                {item.status === "active" ? (
                    <span className="badge bg-success">Aktif</span>
                ) : (
                    <span className="badge bg-danger">Non Aktif</span>
                )}
            </td>
            <td>
                <div className="d-flex justify-content-center gap-2">
                    {
                        ((level=="admin" && item.createdBy=="admin" && item.branch==0) || (item.createdBy!="admin" && item.branch!=0)) && 
                        <button className="btn" disabled={loading} onClick={() => openEdit(item.id)}>
                            <i className="bi bi-pencil text-black" style={{ fontSize: "1.2rem" }}></i>
                        </button>
                    }
                    {
                        ((level=="admin" && item.createdBy=="admin" && item.branch==0) || (item.createdBy!="admin" && item.branch!=0)) &&
                        <button
                            className="btn"
                            disabled={loading}
                            onClick={() => changeStatusHandler(item.id, item.status !== 'active' ? 'active' : 'non-active')}
                        >
                            {item.status === "non-active" ? (
                                <i className="bi bi-check-circle text-black" style={{ fontSize: "1.2rem" }}></i>
                            ) : (
                                <i className="bi bi-x-circle text-black" style={{ fontSize: "1.2rem" }}></i>
                            )}
                        </button>
                    }
                    {
                        ((level=="admin" && item.createdBy=="admin" && item.branch==0) || (item.createdBy!="admin" && item.branch!=0)) &&
                        <button className="btn" disabled={loading} onClick={() => openCopy(item.id, item.judul)}>
                            <i className="bi bi-copy text-black" style={{ fontSize: "1.2rem" }}></i>
                        </button>
                    }
                    {
                        ((level=="admin" && item.createdBy=="admin" && item.branch==0) || (item.createdBy!="admin" && item.branch!=0)) &&
                        <button className="btn" disabled={loading} onClick={() => openPertanyaan(item.id)}>
                            <i className="bi bi-arrow-right-circle text-black" style={{ fontSize: "1.2rem" }}></i>
                        </button>
                    }
                    <button className="btn" disabled={loading} onClick={() => previewPertanyaan(item.id)}>
                        <i className="bi bi-eye text-black" style={{ fontSize: "1.2rem" }}></i>
                    </button>
                    {
                        (level=="fakultas" && item.createdBy=="admin" && item.branch==0) && 
                        <button className="btn" disabled={loading} onClick={() => createBranch(item.id)}>
                            <i className="bi bi-signpost-split text-black" style={{ fontSize: "1.2rem" }}></i>
                        </button>
                    }
                </div>
            </td>
        </tr>
    );
}
BankSoal.LoadingRow = () => (
    <tr key="loading">
        <td className="text-center" colSpan={5}>Memuat data...</td>
    </tr>
);
BankSoal.ErrorRow = () => (
    <tr key="error">
        <td className="text-center" colSpan={5}>
            <button className="btn btn-primary">Refresh</button>
        </td>
    </tr>
);

export default BankSoal;
