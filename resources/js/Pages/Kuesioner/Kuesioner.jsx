import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Component/Layout";
import Modal from "../../Component/Modal";
import PaginationTable from "../../Component/Pagination";
import { fetchKuesioners, deleteKuesioner, setKuesioners, DELETE_KUESIONER_SUCCESS, FETCH_KUESIONERS_REQUEST, FETCH_KUESIONERS_FAILURE, ADD_KUESIONER_REQUEST } from "./redux/actions/kuesionerActions";
import mulai from "../../../../public/assets/img/kuesioner_mulai.png"
import selesai from "../../../../public/assets/img/kuesioner_selesai.png"
import { format } from "date-fns";
import { addKuesioner } from "./redux/actions/kuesionerActions";
import { ADD_KUESIONER_SUCCESS } from "./redux/actions/kuesionerActions";

// import { Inertia } from '@inertiajs/inertia';

function Kuesioner({kuesioner=null, bankSoal=null, peruntukan, prodi=null, fakultas=null, unit=null, target, level=null}) {
    const dispatch = useDispatch();
    const id_kuesioner = useSelector((state) => state.kuesioner.id_kuesioner);
    const kuesioners = useSelector((state) => state.kuesioner.kuesioners);
    const action_type = useSelector((state) => state.kuesioner.action_type);
    const loading = useSelector((state) => state.kuesioner.loading); // Access loading state from Redux

    const [filters, setFilters] = useState({ peruntukan: peruntukan, prodi: prodi, fakultas: fakultas, unit: unit, data: target, start_date: '', end_date: '' });
    const [isModalDeleteVisible, setModalDeleteVisible] = useState(false);

    const debounceTimeout = useRef(null);

    useEffect(()=>{
        if(action_type==DELETE_KUESIONER_SUCCESS){
            setModalDeleteVisible(false);
            dispatch(fetchKuesioners());
        }
        if(action_type==ADD_KUESIONER_SUCCESS){
            setModalDeleteVisible(false);
            window.location.href = `/kuesioner/start/${id_kuesioner}`;
            // dispatch(fetchKuesioners());
        }
    },[loading,action_type])

    useEffect(() => {
        dispatch(fetchKuesioners(filters));
    }, [filters]);

    function changeSelected(id) {
        const updatedKuesioners = kuesioners.record.map((item) =>
          item.id === id ? { ...item, selected: !item.selected } : item
        );
      
        dispatch(setKuesioners(updatedKuesioners));
        console.log("after selected", updatedKuesioners);
    }

    function getTotalSelected() {
        return (kuesioners?.record ?? []).filter(item => item.selected).length;
    }

    function getIdSelected() {
        return (kuesioners?.record ?? []).filter(item => item.selected).map(item => item.id);
    }

    function onDelete() {
        setModalDeleteVisible(true);
    }

    function deleteDataHandler() {
        dispatch(deleteKuesioner(getIdSelected())); // Dispatch delete action
    }

    function isEmptyBankSoal(){
        return bankSoal=="E-B1" || bankSoal=="E-B0" || bankSoal==null || bankSoal == undefined;
    }

    function startKuesioner(id_kuesioner=null){
        if(!isEmptyBankSoal() && id_kuesioner !== null){
            window.location.href = `/kuesioner/start/${id_kuesioner}`;
        } else{
            dispatch(addKuesioner("add", peruntukan, target, bankSoal.id, fakultas, prodi, unit));
        }
    }
    
    function viewKuesioner(id_kuesioner=null){
        window.location.href = `/kuesioner/view/${id_kuesioner}`;
    }

    // Debounced filter change
    const changeFilter = (key, value) => {
        setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
    };

    function renderHeader(){
        if(!(bankSoal?.active_entry ?? false)){
            return <div className="card-header d-flex gap-2 align-items-center">
                        <img src={selesai} style={{ maxWidth: "5rem" }} alt="tidak ada kuesioner" />
                        <p>Tidak ada kuesioner hari ini</p>
                    </div>
        } else if(bankSoal=="E-B1" || bankSoal=="E-B0"){
            return <div className="card-header d-flex gap-2 align-items-center">
                        <img src={selesai} style={{ maxWidth: "5rem" }} alt="erorr template kuesioner" />
                        <p>Gagal mendapatkan data template kuesioner</p>
                    </div>
        } else if(kuesioner=="E-K1"){
            return <div className="card-header d-flex gap-2 align-items-center">
                        <img src={selesai} style={{ maxWidth: "5rem" }} alt="erorr kuesioner" />
                        <p>Gagal mendapatkan data kuesioner</p>
                    </div>
        }

        // console.log({"banksoal":bankSoal, "keusioner":kuesioner})
        return (
            kuesioner==null || kuesioner=="E-K0" || kuesioner!=null? 
                <div className="card-header d-flex flex-wrap gap-4 align-items-center">
                    <img src={mulai} style={{ maxWidth: "5rem" }} alt="belum ada kuesioner" />
                    <div className="row">
                        <p>Ada kuesioner hari ini</p>
                        <button className="btn btn-primary" disabled={loading} onClick={()=>startKuesioner(kuesioner?.id)}>
                            {action_type==ADD_KUESIONER_REQUEST? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ):"Mulai Isi"}
                            </button>
                    </div>
                </div>
                :
                <div className="card-header d-flex flex-wrap gap-4 align-items-center">
                    <img src={mulai} style={{ maxWidth: "5rem" }} alt="sudah ada kuesioner" />
                    <div className="row">
                        <p>Kuesioner hari ini sudah terisi, silahkan ke history kuesioner untuk edit / melihat hasil input sebelumnya</p>
                    </div>
                </div>
        );
    }

    return (
            <>
                <Modal
                    isVisible={isModalDeleteVisible}
                    title="Peringatan"
                    onClose={() => setModalDeleteVisible(false)}
                    showClose={!loading}
                    content={"Anda yakin ingin hapus data?"}
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
                        <h1 className="header-title">Kuesioner</h1>
                        {/* <nav>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item header-subtitle">Kuesioner</li>
                            </ol>
                        </nav> */}
                    </div>

                    <div className="row">
                    <div className="col-12">
                            <div className="card flex-fill table-responsive gap-2 px-4 py-3">
                                {renderHeader()}
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="card flex-fill table-responsive gap-2 px-4 py-3">
                                <div className="card-header">
                                    <div className="d-flex flex-wrap justify-content-between gap-2">
                                        <div>
                                            <b>History Kuesioner</b>
                                        </div>
                                        <div className="d-flex flex-wrap justify-content-xl-end gap-2">
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
                                            </th>
                                            <th>
                                                Peruntukan
                                            </th>
                                            <th>
                                                Tanggal
                                            </th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <Kuesioner.KuesionersBody
                                            action_type={action_type}
                                            kuesioners={kuesioners}
                                            loading={loading}
                                            changeSelected={changeSelected}
                                            startKuesioner={startKuesioner}
                                            viewKuesioner={viewKuesioner}
                                    />
                                </table>

                                <PaginationTable
                                    total={action_type==FETCH_KUESIONERS_REQUEST?  "":(kuesioners.total || 1)}
                                    currentPage={kuesioners.currentPage}
                                    itemsPerPage={5}
                                    onPageChange={(page) => dispatch(fetchKuesioners(filters, page))}
                                />
                            </div>
                        </div>
                    </div>
                </Layout>
            </>
    );
}

Kuesioner.KuesionersBody = ({ action_type, kuesioners, loading, changeSelected, startKuesioner, viewKuesioner}) => {
    if (action_type === FETCH_KUESIONERS_REQUEST) {
        return <Kuesioner.LoadingRow />;
    } else if (action_type === FETCH_KUESIONERS_FAILURE) {
        return <Kuesioner.ErrorRow />;
    } else {
        return (
            <tbody>
                {kuesioners.record?.map(item => (
                    <Kuesioner.KuesionersRow 
                        key={item.id}
                        item={item}
                        loading={loading}
                        changeSelected={changeSelected}
                        startKuesioner={startKuesioner}
                        viewKuesioner={viewKuesioner}
                    />
                ))}
            </tbody>
        );
    }
};
Kuesioner.KuesionersRow = ({ item, loading, changeSelected, startKuesioner, viewKuesioner }) => (
    <tr key={item.id}>
        <td>
            <input type="checkbox" checked={item.selected} onChange={() => changeSelected(item.id)} />
        </td>
        <td>{item.judul}</td>
        <td className="d-none d-xl-table-cell">
            {item.peruntukan}
        </td>
        <td className="d-none d-xl-table-cell">
            {format(new Date(item.tanggal), "dd MMM yyyy")}
        </td>
        <td>
            <div className="d-flex justify-content-center gap-2">
                <button className="btn" disabled={false} onClick={() => viewKuesioner(item?.id)}>
                    <i className="bi bi-eye text-black" style={{ fontSize: "1.2rem" }}></i>
                </button>
                
                {
                    item?.open_edit && 
                    <button className="btn" disabled={false} onClick={() => startKuesioner(item?.id)}>
                        <i className="bi bi-pencil text-black" style={{ fontSize: "1.2rem" }}></i>
                    </button>
                }
            </div>
        </td>
    </tr>
);
Kuesioner.LoadingRow = () => (
    <tr key="loading">
        <td className="text-center" colSpan={5}>Memuat data...</td>
    </tr>
);
Kuesioner.ErrorRow = () => (
    <tr key="error">
        <td className="text-center" colSpan={5}>
            <button className="btn btn-primary">Refresh</button>
        </td>
    </tr>
);

export default Kuesioner;
