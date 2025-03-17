import React, { useEffect, useState } from "react";
import Layout from "../../Component/Layout";
import 'react-calendar-datetime-picker/dist/style.css'
import { useDispatch, useSelector } from "react-redux";
import { FETCH_CHART_FAKULTAS_FAILURE, FETCH_CHART_FAKULTAS_REQUEST, fetchChartFakultas } from "./redux/actions/chartFakultasActions";
import { FETCH_CHART_PRODI_FAILURE, FETCH_CHART_PRODI_REQUEST, fetchChartProdi } from "./redux/actions/chartProdiActions";
import { FETCH_CHART_UNIT_FAILURE, FETCH_CHART_UNIT_REQUEST, fetchChartUnit } from "./redux/actions/chartUnitActions";
import 'react-calendar-datetime-picker/dist/style.css'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, Filler } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, Title, Filler, ChartDataLabels);

function Laporan({level, listBankSoal=[]}) {
    const dispatch = useDispatch();
    
    const cfFakultas = useSelector((state) => state.chartFakultas.chartFakultas);
    const cfActionType = useSelector((state) => state.chartFakultas.action_type);
    const cfErrorMessage = useSelector((state) => state.chartFakultas.error);
    const cfLoading = useSelector((state) => state.chartFakultas.loading); 

    const cpProdi = useSelector((state) => state.chartProdi.chartProdi);
    const cpActionType = useSelector((state) => state.chartProdi.action_type);
    const cpErrorMessage = useSelector((state) => state.chartProdi.error);
    const cpLoading = useSelector((state) => state.chartProdi.loading); 

    const cuUnit = useSelector((state) => state.chartUnit.chartUnit);
    const cuActionType = useSelector((state) => state.chartUnit.action_type);
    const cuErrorMessage = useSelector((state) => state.chartUnit.error);
    const cuLoading = useSelector((state) => state.chartUnit.loading); 

    const [filters, setFilters] = useState({level: level, bankSoal: ''});

    const [bankSoal, setBankSoal] = useState(null);
    const [chartFakultas, setChartFakultas] = useState(false);
    const [chartProdi, setChartProdi] = useState(false);
    const [chartUnit, setChartUnit] = useState(false);
    const [colChart, setColChart] = useState(0);
    const [sourceChartFakultas, setSourceChartFakultas] = useState({
        labels: ["no data"],
        datasets: [
          {
            data: [0],
          }
        ]
    });
    const [sourceChartProdi, setSourceChartProdi] = useState({
        labels: ["no data"],
        datasets: [
          {
            data: [0],
          }
        ]
    });
    const [sourceChartUnit, setSourceChartUnit] = useState({
        labels: ["no data"],
        datasets: [
          {
            data: [0],
          }
        ]
    });

    useEffect(()=>{
        console.log("loading:",cfLoading);
        console.log("action_type:",cfActionType);
    },[cfLoading,cfActionType])

    useEffect(()=>{
        console.log("loading:",cpLoading);
        console.log("action_type:",cpActionType);
    },[cpLoading,cpActionType])

    useEffect(()=>{
        console.log("loading:",cuLoading);
        console.log("action_type:",cuActionType);
    },[cuLoading,cuActionType])

    useEffect(() => {
        if (chartFakultas) {
            dispatch(fetchChartFakultas(bankSoal));
        }
        if (chartProdi) {
            dispatch(fetchChartProdi(bankSoal));
        }
        if (chartUnit) {
            dispatch(fetchChartUnit(bankSoal));
        }
    }, [filters]);

    const changeFilter = (key, value) => {
        setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
    };

    function buildOptionsChart(source){
        return {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(tooltipItem) {
                            return source.labels[tooltipItem[0].dataIndex];
                        },
                        label: function(tooltipItem) {
                            const total = source.datasets[0].data.reduce((acc, val) => acc + val, 0);
                            const value = source.datasets[0].data[tooltipItem.dataIndex];
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `Total: ${value} | Persentase: ${percentage}%`;
                        }
                    }
                },
                datalabels: {
                    formatter: function(value, context) {
                        const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${percentage}%`;  // Display percentage only
                    },
                    color: '#fff',  // White color for labels on the chart
                    font: {
                        weight: 'bold',
                        size: 14
                    }
                }
            }
        }
    }

    function renderChartFakultas(){
        if(cfActionType==FETCH_CHART_FAKULTAS_REQUEST){
            return "loading...";
        } else if(cfActionType==FETCH_CHART_FAKULTAS_FAILURE){
            return cfErrorMessage;
        } else if (!cfFakultas || !cfFakultas.datasets || !cfFakultas.labels) {
                return <p>No data available</p>;
        } else{
            return <Pie data={cfFakultas} options={buildOptionsChart(cfFakultas)} />
        }
    }
    function renderChartProdi(){
        if(cpActionType==FETCH_CHART_PRODI_REQUEST){
            return "loading...";
        } else if(cpActionType==FETCH_CHART_PRODI_FAILURE){
            return cpErrorMessage;
        } else if (!cpProdi || !cpProdi.datasets || !cpProdi.labels) {
            return <p>No data available</p>;
        } else{
            return <Pie data={cpProdi} options={buildOptionsChart(cpProdi)} />
        }
    }
    function renderChartUnit(){
        if(cuActionType==FETCH_CHART_UNIT_REQUEST){
            return "loading...";
        } else if(cuActionType==FETCH_CHART_UNIT_FAILURE){
            return cuErrorMessage;
        } else if (!cuUnit || !cuUnit.datasets || !cuUnit.labels) {
            return <p>No data available</p>;
        } else{
            return <Pie data={cuUnit} options={buildOptionsChart(cuUnit)}/>
        }
    }

    return (
            <>
                <Layout level={level}>
                    <div className="header">
                        <h1 className="header-title">Laporan Kuesioner</h1>
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
                                            const bs = listBankSoal.find(l => l.id == e.target.value) 
                                            console.log(bs.peruntukan)

                                            setBankSoal(e.target.value)
                                            if(bs.peruntukan=="mahasiswa"){
                                                setChartFakultas(true)
                                                setChartProdi(true)
                                                setChartUnit(false)
                                                setColChart(2)
                                            }
                                            if(bs.peruntukan=="dosen"){
                                                setChartFakultas(true)
                                                setChartProdi(false)
                                                setChartUnit(false)
                                                setColChart(1)
                                            }
                                            if(bs.peruntukan=="tendik"){
                                                setChartFakultas(false)
                                                setChartProdi(false)
                                                setChartUnit(true)
                                                setColChart(1)
                                            }
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
                                    <button className="btn btn-primary" onClick={()=>{
                                        setBankSoal(null)
                                    }}>Hapus filter</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-9 col-lg-9 col-md-9 col-sm-12">
                            <div className="card d-flex flex-row gap-2 px-4 py-3">
                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 flex-fill">
                                    {
                                        colChart==0 && 
                                        <p>No Data</p>
                                    }
                                    {
                                        colChart>0 && 
                                        <div className="row">
                                            {
                                                chartFakultas && 
                                                <div className={colChart==1? `col-12`:`col-${12/colChart}`}>
                                                    <div className="row">
                                                        <h4>Fakultas</h4>
                                                        {renderChartFakultas()}
                                                    </div>
                                                </div>
                                            }
                                            {
                                                chartProdi && 
                                                <div className={colChart==1? `col-12`:`col-${12/colChart}`}>
                                                    <div className="row">
                                                        <h4>Prodi</h4>
                                                        {renderChartProdi()}
                                                    </div>
                                                </div>
                                            }
                                            {
                                                chartUnit && 
                                                <div className={colChart==1? `col-12`:`col-${12/colChart}`}>
                                                    <div className="row">
                                                        <h4>Unit</h4>
                                                        {renderChartUnit()}
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout>
            </>
    );
}

export default Laporan;
