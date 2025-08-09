import React, { useEffect, useState } from "react";
import Layout from "../../Component/Layout";
import 'react-calendar-datetime-picker/dist/style.css'
import { useDispatch, useSelector } from "react-redux";
import { FETCH_CHART_FAKULTAS_FAILURE, FETCH_CHART_FAKULTAS_REQUEST, fetchChartFakultas } from "./redux/actions/chartFakultasActions";
import { FETCH_CHART_PRODI_FAILURE, FETCH_CHART_PRODI_REQUEST, fetchChartProdi } from "./redux/actions/chartProdiActions";
import { FETCH_CHART_UNIT_FAILURE, FETCH_CHART_UNIT_REQUEST, fetchChartUnit } from "./redux/actions/chartUnitActions";
import 'react-calendar-datetime-picker/dist/style.css'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, Filler, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FETCH_CHART_FAILURE, FETCH_CHART_REQUEST, fetchChart } from "./redux/actions/chartActions";

ChartJS.register(ArcElement, Tooltip, Legend, Title, Filler, ChartDataLabels, CategoryScale, LinearScale, BarElement);

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

    const chart = useSelector((state) => state.chart.chart);
    const ActionType = useSelector((state) => state.chart.action_type);
    const ErrorMessage = useSelector((state) => state.chart.error);
    const Loading = useSelector((state) => state.chart.loading); 

    const [filters, setFilters] = useState({level: level, bankSoal: ''});

    const [bankSoal, setBankSoal] = useState(null);
    const [chartFakultas, setChartFakultas] = useState(false);
    const [chartProdi, setChartProdi] = useState(false);
    const [chartUnit, setChartUnit] = useState(false);
    const [colChart, setColChart] = useState(0);

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

    useEffect(()=>{
        console.log("loading:",Loading);
        console.log("action_type:",ActionType);
    },[Loading,ActionType])

    useEffect(() => {
        if (![null, "", undefined].includes(bankSoal) && chartFakultas) {
            dispatch(fetchChartFakultas(bankSoal));
        }
        if (![null, "", undefined].includes(bankSoal) && chartProdi) {
            dispatch(fetchChartProdi(bankSoal));
        }
        if (![null, "", undefined].includes(bankSoal) && chartUnit) {
            dispatch(fetchChartUnit(bankSoal));
        }

        if(![null, "", undefined].includes(bankSoal)){
            dispatch(fetchChart(bankSoal));
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
    function RataRataRatingChart({ data }) {
        const ratingCharts = data.filter(item => item.jenis_pilihan === "rating5");

        const totalRatings = ratingCharts.reduce((acc, curr) => {
            const values = curr.chart.datasets[0].data;
            values.forEach((val, idx) => {
                acc[idx] = (acc[idx] || 0) + val;
            });
            return acc;
        }, []);

        const avgRatings = (totalRatings.length > 0 ? totalRatings : [0, 0, 0, 0, 0])
                                .map(val => Number((val / (ratingCharts.length || 1)).toFixed(3)));


        const chartData = {
            labels: ["1", "2", "3", "4", "5"],
            datasets: [
                {
                    label: "Rata-rata Rating",
                    data: avgRatings,
                    backgroundColor: "rgba(54, 162, 235, 0.7)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            responsive: true,
            plugins: { title: { display: false } },
            scales: { y: { beginAtZero: true } },
        };

        return (
            <div className="row">
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 text-center text-success">
                    Rata-rata Rating
                </div>
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <Bar data={chartData} options={options} />
                </div>
            </div>
        );
    }

    function renderChart() {
        console.log(chart); 
    
        if(ActionType==FETCH_CHART_REQUEST){
            return <div class="card px-4 py-3">
            <div class="grid-top">
                <div class="col-12">
                    <p>loading ...</p>
                </div>
            </div>
        </div>;
        } else if(ActionType==FETCH_CHART_FAILURE){
            return ErrorMessage;
        } else if (!chart || Object.keys(chart).length === 0) {
            return <div class="card px-4 py-3">
                <div class="grid-top">
                    <div class="col-12">
                        <p>No Data</p>
                    </div>
                </div>
            </div>;
        }
        
        return Object.keys(chart).map((key) => {
            const splitKey = key.split("#").filter(item => item !== "" && item !== null && item !== undefined);

            let title = "unknown";
            if(splitKey.length==1){
                title = splitKey[0]
            } else if(splitKey.length>1){
                title = splitKey.join(" > ")
            }

            return <div key={key} class="card d-flex flex-row">
                <div class="col-12">
                    <h3 class="text-primary bg-primary text-white px-3 py-3">{title}</h3>
                    <div class="grid px-4 py-3">
                        {
                            chart[key].map((c, i) => (
                                <div key={i} className="row">
                                    <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 text-center text-success">{c.pertanyaan}</div>
                                    <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                        {c.jenis_pilihan === "rating5" 
                                            ? <Bar data={c.chart} options={buildOptionsChart(c.chart)} />
                                            : <Pie data={c.chart} options={buildOptionsChart(c.chart)} />}
                                    </div>
                                </div>
                            ))
                        }
                        <RataRataRatingChart data={chart[key]} />
                    </div>
                </div>
            </div>
        });
    }
      

    return (
            <>
                <Layout level={level}>
                    <div className="header">
                        <h1 className="header-title">Laporan Kuesioner</h1>
                    </div>

                    <div class="row">
                        <div class="col-xl-3 col-lg-3 col-md-4 col-sm-12">
                            <div class="card d-flex gap-2 px-4 py-3">
                                <div class="col-12">
                                    <h3>Filter</h3>
                                </div>
                                <div class="col-12">
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
                                <div class="col-12">
                                    <button className="btn btn-primary" onClick={()=>{setBankSoal(null)}}>Hapus filter</button>
                                </div>
                            </div>
                        </div>

                        <div class="col-xl-9 col-lg-9 col-md-8 col-sm-12">
                            <div class="card px-4 py-3">
                                <div className="grid-top">
                                {
                                        colChart==0 && 
                                        <div class="col-12">
                                            <p>No Data</p>
                                        </div>
                                    }
                                    {
                                        colChart>0 && 
                                        <>
                                            {
                                                chartFakultas && 
                                                <div className="row">
                                                    <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                                        <h4>Fakultas</h4>
                                                        {renderChartFakultas()}
                                                    </div>
                                                </div>
                                            }
                                            {
                                                chartProdi && 
                                                <div className="row">
                                                    <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                                        <h4>Prodi</h4>
                                                        {renderChartProdi()}
                                                    </div>
                                                </div>
                                            }
                                            {
                                                chartUnit && 
                                                <div className="row">
                                                    <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                                        <h4>Unit</h4>
                                                        {renderChartUnit()}
                                                    </div>
                                                </div>
                                            }
                                        </>
                                    }
                                </div>
                            </div>
                            
                            {renderChart()}
                        </div>
                    </div>
                </Layout>
            </>
    );
}

export default Laporan;
