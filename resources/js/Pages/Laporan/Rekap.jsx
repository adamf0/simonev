import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Component/Layout";
import PaginationTable from "../../Component/Pagination";
import { format } from "date-fns";
import { FETCH_REKAPS_FAILURE, FETCH_REKAPS_REQUEST, fetchRekapKuesioners } from "./redux/actions/rekapActions";
import { DtCalendar } from 'react-calendar-datetime-picker'
import 'react-calendar-datetime-picker/dist/style.css'
// import { Inertia } from '@inertiajs/inertia';

function RekapKuesioner({kode_fakultas, level=null, listMahasiswa=[], listDosen=[], listTendik=[], listFakultas=[], listUnit=[]}) {
    const dispatch = useDispatch();
    const [npm, setNpm] = useState(null);
    const [nidn, setNidn] = useState(null);
    const [nip, setNip] = useState(null);
    const [fakultas, setFakultas] = useState(kode_fakultas);
    const [prodi, setProdi] = useState(null);
    const [dosen, setDosen] = useState(null);
    const [tendik, setTendik] = useState(null);
    const [unit, setUnit] = useState(null);

    const [listTendiks, setlistTendik] = useState(listTendik??[]);
    const [listMahasiswas, setlistMahasiswa] = useState(listMahasiswa??[]);
    const [listProdi, setListProdi] = useState([]);
    const [date, setDate] = useState(null);
    const rekaps = useSelector((state) => state.rekap.rekaps);
    const action_type = useSelector((state) => state.rekap.action_type);
    const loading = useSelector((state) => state.rekap.loading); // Access loading state from Redux

    const [filters, setFilters] = useState({ npm: '', nidn: '', nip: '', unit:'', fakultas: level=='fakultas'? kode_fakultas:null, level: level, start_date: '', end_date: '' });
    const debounceTimeout = useRef(null);

    useEffect(()=>{
        console.log(rekaps)
    },[loading,action_type])

    useEffect(() => {
        const selectedFakultas = listFakultas.filter(item => item.id === `${fakultas}`);
        if (selectedFakultas.length > 0) {
            setListProdi(selectedFakultas[0]?.prodis ?? []);
        } else {
            setListProdi([]);
        }
    }, [fakultas]);

    const filteredMahasiswa = useMemo(() => 
        listMahasiswa.filter(item => item.kode_prodi === prodi), 
        [listMahasiswa, prodi]
    );

    useEffect(() => {
        setListMahasiswa(filteredMahasiswa);
    }, [filteredMahasiswa]);

    useEffect(() => {
        const list = listTendik.filter(item => {
            return item.unit_kerja == `${unit}`
        })
        setlistTendik(list)
    }, [unit]);

    useEffect(() => {
        dispatch(fetchRekapKuesioners(filters));
    }, [filters]);

    useEffect(() => {
        changeFilter("date",date);
    }, [date]);

    const changeFilter = (key, value) => {
        if(key=="date"){
            if(value!=null && value?.from != null && value?.to != null){
                setFilters(prevFilters => ({ ...prevFilters, start_date: `${value?.from?.year}-${String(value?.from?.month).padStart(2, '0')}-${String(value?.from?.day).padStart(2, '0')}`, end_date: `${value?.to?.year}-${String(value?.to?.month).padStart(2, '0')}-${String(value?.to?.day).padStart(2, '0')}` }));
            }
        } else{
            setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
        }
    };

    function clearFilter(){
        setNidn(null)
        setNip(null)
        setNpm(null)
        setFakultas(null)
        setProdi(null)
        setDate(null)
        setDosen(null)
        setTendik(null)
        setUnit(null)
        setFilters(prevFilters => ({ ...prevFilters, npm: null, nidn: null, nip:null, start_date:null, end_date:null }));
    }

    function viewRekapKuesioner(id_kuesioner){
        window.location.href = `/kuesioner/view/${id_kuesioner}`;
    }

    return (
            <>
                <Layout level={level}>
                    <div className="header">
                        <h1 className="header-title">Rekap Kuesioner</h1>
                        {/* <nav>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item header-subtitle">RekapKuesioner</li>
                            </ol>
                        </nav> */}
                    </div>

                    <div className="row">
                        <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                            <div className="card flex-fill gap-2 px-4 py-3">
                                <div className="col-12">
                                   <h4>Filter</h4>
                                </div>
                                {
                                    level=='admin'?
                                    <div className="col-12">
                                        <label>Fakultas</label>
                                        <select className="form-select" onChange={(e)=>{
                                                setFakultas(e.target.value)
                                                changeFilter("fakultas",e.target.value);
                                            }}>
                                            <option value=""></option>
                                            {
                                                listFakultas.map(f => <option value={f.id} selected={fakultas==f.id}>{f.id} - {f.text}</option>)
                                            }
                                        </select>
                                    </div> : 
                                    <></>
                                }
                                <div className="col-12">
                                    <label>Prodi</label>
                                    <select className="form-select" onChange={(e)=>{
                                            setProdi(e.target.value)
                                            changeFilter("prodi",e.target.value);
                                        }}>
                                        <option value=""></option>
                                        {
                                            listProdi.map(p => {
                                                return <option value={p.id} selected={prodi==p.id}>{p.id} - {p.text}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label>Nama Mahasiswa</label>
                                    <select className="form-select" onChange={(e)=>{
                                            setNpm(e.target.value)
                                            changeFilter("npm",e.target.value);
                                        }}>
                                        <option value=""></option>
                                        {
                                            fakultas != null && prodi!=null? 
                                            listMahasiswas.map(mahasiswa => <option value={mahasiswa.nim} selected={mahasiswa.nim==npm}>{mahasiswa.nim} - {mahasiswa.nama_mahasiswa}</option>):
                                            <></>
                                        }
                                    </select>
                                </div>
                                {
                                    level=='admin'?
                                    <>
                                        <div className="col-12">
                                            <label>Nama Dosen</label>
                                            <select className="form-select" onChange={(e)=>{
                                                    setNidn(e.target.value)
                                                    changeFilter("nidn",e.target.value);
                                                }}>
                                                <option value=""></option>
                                                {
                                                    listDosen.map(dosen => <option value={dosen.nidn} selected={dosen.nidn==nidn}>{dosen.nidn} - {dosen.nama}</option>)
                                                }
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label>Unit</label>
                                            <select className="form-select" onChange={(e)=>{
                                                    setUnit(e.target.value)
                                                    changeFilter("unit",e.target.value);
                                                }}>
                                                <option value=""></option>
                                                {
                                                    listUnit.map(u => <option value={u.unit_kerja} selected={u.unit_kerja==unit}>{u.text}</option>)
                                                }
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label>Nama Tendik</label>
                                            <select className="form-select" onChange={(e)=>{
                                                    setTendik(e.target.value)
                                                    changeFilter("nip",e.target.value);
                                                }}>
                                                <option value=""></option>
                                                {
                                                    listTendiks.map(t => <option value={t.nip} selected={t.nip==tendik}>{t.nip} - {t.nama}</option>)
                                                }
                                            </select>
                                        </div>
                                    </> : <></>
                                }
                                <div className="col-12">
                                    <label>Tanggal</label>
                                    <DtCalendar
                                        onChange={setDate}
                                        showWeekend
                                        type={'range'}
                                    />
                                </div>
                                <div className="col-12">
                                    <button className="btn btn-primary" onClick={()=>clearFilter()}>Hapus Filter</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-9 col-lg-9 col-md-12 col-sm-12">
                            <div className="card flex-fill table-responsive gap-2 px-4 py-3">
                                <table className="table table-striped text-center">
                                    <thead>
                                        <tr>
                                            <th>
                                                
                                            </th>
                                            <th>
                                                Nama
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
                                    <RekapKuesioner.RekapKuesionersBody
                                            action_type={action_type}
                                            rekaps={rekaps}
                                            loading={loading}
                                            viewRekapKuesioner={viewRekapKuesioner}
                                    />
                                </table>

                                <PaginationTable
                                    total={action_type==FETCH_REKAPS_REQUEST?  "":(rekaps.total || 1)}
                                    currentPage={rekaps.currentPage}
                                    itemsPerPage={5}
                                    onPageChange={(page) => dispatch(fetchRekapKuesioners(filters, page))}
                                />
                            </div>
                        </div>
                    </div>
                </Layout>
            </>
    );
}

function renderNama(item){
    if(item.npm!=null){
        return `${item.npm} - ${item.nama_mahasiswa}`
    } else if(item.nidn!=null){
        return `${item.nidn} - ${item.nama_dosen}`
    } else if(item.nip!=null){
        return <div className="d-flex justify-content-center">
            <div className="d-flex gap-2">
                {item.nip} - {item.nama_tendik} 
                {item.unit_kerja!=null? <span class="badge bg-primary">{item.tendik?.unit_kerja}</span>:""}
            </div>
        </div>
    }
    return "";
}

RekapKuesioner.RekapKuesionersBody = ({ action_type, rekaps, loading, viewRekapKuesioner}) => {
    if (action_type === FETCH_REKAPS_REQUEST) {
        return <RekapKuesioner.LoadingRow />;
    } else if (action_type === FETCH_REKAPS_FAILURE) {
        return <RekapKuesioner.ErrorRow />;
    } else {
        return (
            <tbody>
                {rekaps.record?.map(item => (
                    <RekapKuesioner.RekapKuesionersRow 
                        key={item.id}
                        item={item}
                        loading={loading}
                        viewRekapKuesioner={viewRekapKuesioner}
                    />
                ))}
            </tbody>
        );
    }
};
RekapKuesioner.RekapKuesionersRow = ({ item, loading, viewRekapKuesioner }) => (
    <tr key={item.id} className="text-center">
        <td>

        </td>
        <td>
            {renderNama(item)}
        </td>
        <td>
            {item.peruntukan}
        </td>
        <td>
            {format(new Date(item.tanggal), "dd MMM yyyy")}
        </td>
        <td>
            <div className="d-flex justify-content-center gap-2">
                <button className="btn" disabled={false} onClick={() => viewRekapKuesioner(item?.id)}>
                    <i className="bi bi-eye text-black" style={{ fontSize: "1.2rem" }}></i>
                </button>
            </div>
        </td>
    </tr>
);
RekapKuesioner.LoadingRow = () => (
    <tr key="loading">
        <td className="text-center" colSpan={5}>Memuat data...</td>
    </tr>
);
RekapKuesioner.ErrorRow = () => (
    <tr key="error">
        <td className="text-center" colSpan={5}>
            <button className="btn btn-primary">Refresh</button>
        </td>
    </tr>
);

export default RekapKuesioner;
