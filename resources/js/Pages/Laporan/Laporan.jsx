import React, { useEffect, useState } from "react";
import Layout from "../../Component/Layout";
import 'react-calendar-datetime-picker/dist/style.css'
import { useDispatch, useSelector } from "react-redux";
import PaginationTable from "../../Component/Pagination";
import { FETCH_LAPORANS_FAILURE, FETCH_LAPORANS_REQUEST, fetchLaporans } from "./redux/actions/laporanActions";
import { DtCalendar } from 'react-calendar-datetime-picker'
import 'react-calendar-datetime-picker/dist/style.css'

function Laporan({level, listFakultas=[], listProdi=[], listUnit=[], listAngkatan=[], listBankSoal=[]}) {
    const dispatch = useDispatch();
    const laporans = useSelector((state) => state.laporan.laporans);
    const action_type = useSelector((state) => state.laporan.action_type);
    const errorMessage = useSelector((state) => state.laporan.error);
    const loading = useSelector((state) => state.laporan.loading); // Access loading state from Redux

    const [filters, setFilters] = useState({start_date: '', end_date: '', level: level, bankSoal: ''});
    const [modePerhitungan, setModePerhitungan] = useState("total");
    const [date, setDate] = useState(null);
    const [bankSoal, setBankSoal] = useState(null);

    useEffect(()=>{
        console.log("loading:",loading);
        console.log("action_type:",action_type);
    },[loading,action_type])

    useEffect(() => {
        dispatch(fetchLaporans(filters));
    }, [filters]);

    useEffect(() => {
        changeFilter("date",date);
    }, [date]);

    const changeFilter = (key, value) => {
        if(key=="date"){
            if(value!=null && value?.from != null && value?.to != null){
                setFilters(prevFilters => ({ ...prevFilters, start_date: `${value?.from?.year}-${String(value?.from?.month).padStart(2, '0')}-${String(value?.from?.day).padStart(2, '0')}`, end_date: `${value?.to?.year}-${String(value?.to?.month).padStart(2, '0')}-${String(value?.to?.day).padStart(2, '0')}` }));
            } 
            else{
                setFilters(prevFilters => ({ ...prevFilters, start_date: "", end_date: "" }));
            }
        } else{
            setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
        }
    };

    return (
            <>
                <Layout level={level}>
                    <div className="header">
                        <h1 className="header-title">Laporan Kuesioner</h1>
                        {/* <nav>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item header-subtitle">RekapKuesioner</li>
                            </ol>
                        </nav> */}
                    </div>

                    <div className="row">
                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12">
                            <div className="card d-flex gap-2 px-4 py-3">
                                <div className="col-12">
                                    <h3>Filter</h3>
                                </div>
                                <div className="col-12">
                                    <label>Bank Soal</label>
                                    <select className="form-select" onChange={(e)=>{
                                            setBankSoal(e.target.value)
                                            changeFilter("bankSoal",e.target.value);
                                        }}>
                                        <option value=""></option>
                                        {
                                            listBankSoal.map(b => {
                                                return <option value={b.id} selected={bankSoal==b.id}>{b.text}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label>Tanggal</label>
                                        <DtCalendar
                                            onChange={setDate}
                                            showWeekend
                                            type={'range'}
                                        />
                                </div>
                                <div className="col-12">
                                    <button className="btn btn-primary" onClick={()=>{
                                        setDate(null)
                                        setBankSoal(null)
                                    }}>Hapus filter</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-9 col-lg-9 col-md-9 col-sm-12">
                            <div className="card d-flex flex-row gap-2 px-4 py-3">
                                {/* Sidebar Tab di Kiri */}
                                <ul className="nav flex-column nav-pills col-xl-2 col-lg-2 col-md-2 col-sm-2">
                                    <li className="nav-item">
                                        <a className={`nav-link ${modePerhitungan=='total'? 'active':''}`} aria-current="page" href="#" onClick={()=>setModePerhitungan("total")}>Total</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link ${modePerhitungan=='bobot+nilai'? 'active':''}`} href="#" onClick={()=>setModePerhitungan("bobot+nilai")}>Bobot * Nilai</a>
                                    </li>
                                </ul>

                                {/* Tabel di Kanan */}
                                <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10 flex-fill table-responsive">
                                    <table className="table table-striped text-center">
                                        <thead>
                                            <tr>
                                                <th rowSpan={2}>Soal</th>
                                                <th rowSpan={2}>Jawaban</th>
                                                {
                                                    level=="prodi" || level=="admin"? 
                                                    <th colSpan={listAngkatan.length}>
                                                        Mahasiswa
                                                    </th>: 
                                                    <></>
                                                }
                                                {
                                                    level=="admin"?
                                                    <th colSpan={listFakultas.length}>
                                                        Fakultas
                                                    </th> : 
                                                    <></>
                                                }
                                                {
                                                    level=="fakultas" || level=="admin"?
                                                    <th colSpan={listProdi.length}>
                                                        Prodi
                                                    </th> : 
                                                    <></>
                                                }
                                                {
                                                    level=="admin"?
                                                    <th colSpan={listUnit.length}>
                                                        Unit
                                                    </th> : 
                                                    <></>
                                                }
                                            </tr>
                                            <tr>
                                                {
                                                    level=="prodi" || level=="admin"? 
                                                    listAngkatan.map(angkatan => <th style={{ whiteSpace: 'nowrap' }}>{angkatan}</th>): 
                                                    <></>
                                                }
                                                {
                                                    level=="admin"?
                                                    listFakultas.map(fakultas => <th style={{ whiteSpace: 'nowrap' }}>{fakultas.nama_fakultas}</th>) : 
                                                    <></>
                                                }
                                                {
                                                    level=="fakultas" || level=="admin"?
                                                    listProdi.map(prodi => <th style={{ whiteSpace: 'nowrap' }}>{prodi.nama_prodi}</th>) : 
                                                    <></>
                                                }
                                                {
                                                    level=="admin"?
                                                    listUnit.map(unit => <th style={{ whiteSpace: 'nowrap' }}>{unit.text}</th>) : 
                                                    <></>
                                                }
                                            </tr>
                                        </thead>
                                        <Laporan.LaporansBody
                                                action_type={action_type}
                                                laporans={laporans}
                                                loading={loading}
                                                columnsAngkatan={listAngkatan}
                                                columnsFakultas={listFakultas}
                                                columnsProdi={listProdi}
                                                columnsUnit={listUnit}
                                                modePerhitungan={modePerhitungan}
                                                level={level}/>
                                    </table>

                                    <PaginationTable
                                        total={action_type==FETCH_LAPORANS_REQUEST?  "":(laporans.total || 1)}
                                        currentPage={laporans.currentPage}
                                        itemsPerPage={5}
                                        onPageChange={(page) => dispatch(fetchLaporans(filters, page))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout>
            </>
    );
}

Laporan.LaporansBody = ({ action_type, laporans, loading, columnsAngkatan, columnsFakultas, columnsProdi, columnsUnit, modePerhitungan='total', level}) => {
    if (action_type === FETCH_LAPORANS_REQUEST) {
        return <Laporan.LoadingRow />;
    } else if (action_type === FETCH_LAPORANS_FAILURE) {
        return <Laporan.ErrorRow />;
    } else {
        const totalAngkatan = columnsAngkatan.map(angkatan =>
            laporans.record?.reduce((sum, item) => {
                const nilai = Number(item[`mahasiswa_${angkatan}`]) || 0;
                return modePerhitungan === 'total'
                    ? sum + nilai
                    : sum + (nilai * (Number(item[`bobot`]) || 0) * (Number(item[`nilai`]) || 0));
            }, 0)
        );
        
        const totalFakultas = columnsFakultas.map(fakultas =>
            laporans.record?.reduce((sum, item) => {
                const nilai = Number(item[`fakultas_${fakultas.kode_fakultas}`]) || 0;
                return modePerhitungan === 'total'
                    ? sum + nilai
                    : sum + (nilai * (Number(item[`bobot`]) || 0) * (Number(item[`nilai`]) || 0));
            }, 0)
        );
        
        const totalProdi = columnsProdi.map(prodi =>
            laporans.record?.reduce((sum, item) => {
                const nilai = Number(item[`prodi_${prodi.kode_prodi}`]) || 0;
                return modePerhitungan === 'total'
                    ? sum + nilai
                    : sum + (nilai * (Number(item[`bobot`]) || 0) * (Number(item[`nilai`]) || 0));
            }, 0)
        );
        
        const totalUnit = columnsUnit.map(unit =>
            laporans.record?.reduce((sum, item) => {
                const nilai = Number(item[`unit_${unit.unit_kerja}`]) || 0;
                return modePerhitungan === 'total'
                    ? sum + nilai
                    : sum + (nilai * (Number(item[`bobot`]) || 0) * (Number(item[`nilai`]) || 0));
            }, 0)
        );
        
        return (
            <tbody>
                {laporans.record?.map(item => (
                    <Laporan.LaporansRow 
                        key={item.id}
                        item={item}
                        loading={loading}
                        columnsAngkatan={columnsAngkatan}
                        columnsFakultas={columnsFakultas}
                        columnsProdi={columnsProdi}
                        columnsUnit={columnsUnit}
                        modePerhitungan={modePerhitungan}
                        level={level}
                    />
                ))}
                <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                    <td colSpan={2}>Total</td>
                    {
                        level=="prodi" || level=="admin"? 
                        totalAngkatan.map((total, index) => <td key={`total-angkatan-${index}`}>{total}</td>) : 
                        <></>
                    }
                    {
                        level=="admin"?
                        totalFakultas.map((total, index) => <td key={`total-fakultas-${index}`}>{total}</td>) : 
                        <></>
                    }
                    {
                        level=="fakultas" || level=="admin"?
                        totalProdi.map((total, index) => <td key={`total-prodi-${index}`}>{total}</td>) : 
                        <></>
                    }
                    {
                        level=="admin"?
                        totalUnit.map((total, index) => <td key={`total-unit-${index}`}>{total}</td>) : 
                        <></>
                    }
                </tr>
            </tbody>
        );
    }
};
Laporan.LaporansRow = ({ item, loading, columnsAngkatan, columnsFakultas, columnsProdi, columnsUnit, modePerhitungan='total', level }) => { 
    return (
        <tr key={item.id}>
            <td>{item.pertanyaan}</td>
            <td>{item.jawaban}</td>
            {
                level=="prodi" || level=="admin"? 
                columnsAngkatan.map(angkatan => (
                    <td key={`angkatan_${angkatan}`}>
                        {modePerhitungan === 'total' 
                            ? item[`mahasiswa_${angkatan}`] 
                            : (Number(item[`mahasiswa_${angkatan}`]) || 0) * (Number(item[`bobot`]) || 0) * (Number(item[`nilai`]) || 0)}
                    </td>
                )) : 
                <></>
            }
            {
                level=="admin"?
                columnsFakultas.map(fakultas => (
                    <td key={`fakultas_${fakultas.kode_fakultas}`}>
                        {modePerhitungan === 'total' 
                            ? item[`fakultas_${fakultas.kode_fakultas}`] 
                            : (Number(item[`fakultas_${fakultas.kode_fakultas}`]) || 0) * (Number(item[`bobot`]) || 0) * (Number(item[`nilai`]) || 0)}
                    </td>
                )) : 
                <></>
            }
            {
                level=="fakultas" || level=="admin"?
                columnsProdi.map(prodi => (
                    <td key={`prodi_${prodi.kode_prodi}`}>
                        {modePerhitungan === 'total' 
                            ? item[`prodi_${prodi.kode_prodi}`] 
                            : (Number(item[`prodi_${prodi.kode_prodi}`]) || 0) * (Number(item[`bobot`]) || 0) * (Number(item[`nilai`]) || 0)}
                    </td>
                )) : 
                <></>
            }
            {
                level=="admin"?
                columnsUnit.map(unit => (
                    <td key={`unit_${unit.unit_kerja}`}>
                        {modePerhitungan === 'total' 
                            ? item[`unit_${unit.unit_kerja}`] 
                            : (Number(item[`unit_${unit.unit_kerja}`]) || 0) * (Number(item[`bobot`]) || 0) * (Number(item[`nilai`]) || 0)}
                    </td>
                )) : 
                <></>
            }
        </tr>
    );
}
Laporan.LoadingRow = () => (
    <tr key="loading">
        <td className="text-center" colSpan={5}>Memuat data...</td>
    </tr>
);
Laporan.ErrorRow = () => (
    <tr key="error">
        <td className="text-center" colSpan={5}>
            <button className="btn btn-primary">Refresh</button>
        </td>
    </tr>
);

export default Laporan;
