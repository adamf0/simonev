import React, { useEffect, useState } from "react";
import Layout from "../../Component/Layout";
import 'react-calendar-datetime-picker/dist/style.css'
import { useDispatch, useSelector } from "react-redux";
import { FETCH_CHART_FAKULTAS_LABEL_FAILURE, FETCH_CHART_FAKULTAS_LABEL_REQUEST, fetchChartFakultasLabel } from "./redux/actions/fetchChartFakultasLabel";
import { FETCH_CHART_PRODI_LABEL_FAILURE, FETCH_CHART_PRODI_LABEL_SUCCESS, fetchChartProdiLabel } from "./redux/actions/fetchChartProdiLabel";
import { FETCH_CHART_UNIT_LABEL_FAILURE, FETCH_CHART_UNIT_LABEL_REQUEST, fetchChartUnitLabel } from "./redux/actions/fetchChartUnitLabel";
import 'react-calendar-datetime-picker/dist/style.css'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, Filler, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FETCH_CHART_FAILURE, FETCH_CHART_REQUEST, fetchChart } from "./redux/actions/chartActions";

ChartJS.register(ArcElement, Tooltip, Legend, Title, Filler, ChartDataLabels, CategoryScale, LinearScale, BarElement);

function Laporan({level, listBankSoal=[]}) {
    const dispatch = useDispatch();
    
    const cfFakultas = useSelector((state) => state.chartFakultasLabel.chartFakultasLabel);
    const cfActionType = useSelector((state) => state.chartFakultasLabel.action_type);
    const cfErrorMessage = useSelector((state) => state.chartFakultasLabel.error);
    const cfLoading = useSelector((state) => state.chartFakultasLabel.loading); 

    const cpProdi = useSelector((state) => state.chartProdiLabel.chartProdiLabel);
    const cpActionType = useSelector((state) => state.chartProdiLabel.action_type);
    const cpErrorMessage = useSelector((state) => state.chartProdiLabel.error);
    const cpLoading = useSelector((state) => state.chartProdiLabel.loading); 

    const cuUnit = useSelector((state) => state.chartUnitLabel.chartUnitLabel);
    const cuActionType = useSelector((state) => state.chartUnitLabel.action_type);
    const cuErrorMessage = useSelector((state) => state.chartUnitLabel.error);
    const cuLoading = useSelector((state) => state.chartUnitLabel.loading); 

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
            dispatch(fetchChartFakultasLabel(bankSoal));
        }
        if (![null, "", undefined].includes(bankSoal) && chartProdi) {
            dispatch(fetchChartProdiLabel(bankSoal));
        }
        if (![null, "", undefined].includes(bankSoal) && chartUnit) {
            dispatch(fetchChartUnitLabel(bankSoal));
        }

        if(![null, "", undefined].includes(bankSoal)){
            dispatch(fetchChart(bankSoal));
        }
        
    }, [filters]);

    const changeFilter = (key, value) => {
        setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
    };

    function buildOptionsChart(source, hiddenLegend = false){
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
                legend: {
                    display: !hiddenLegend
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
        if(cfActionType==FETCH_CHART_FAKULTAS_LABEL_REQUEST){
            return "loading...";
        } else if(cfActionType==FETCH_CHART_FAKULTAS_LABEL_FAILURE){
            return cfErrorMessage;
        } else{
            console.log(cfFakultas);
            return (
                <ul>
                    {cfFakultas.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                </ul>
            );
        }
    }
    function renderChartProdi(){
        if(cpActionType==FETCH_CHART_PRODI_LABEL_SUCCESS){
            return "loading...";
        } else if(cpActionType==FETCH_CHART_PRODI_LABEL_FAILURE){
            return cpErrorMessage;
        } else{
            console.log(cpProdi);  
            return (
                <ul>
                    {cpProdi.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                </ul>
            );
        }
    }
    function renderChartUnit(){
        if(cuActionType==FETCH_CHART_UNIT_LABEL_REQUEST){
            return "loading...";
        } else if(cuActionType==FETCH_CHART_UNIT_LABEL_FAILURE){
            return cuErrorMessage;
        } else{
            console.log(cuUnit); 
            console.log(cuUnit);
            return (
                <ul>
                    {cuUnit.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                </ul>
            ); 
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
            plugins: { 
                title: { 
                    display: false 
                }, 
                legend: {
                    display: false
                }
            },
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
                                            ? <Bar data={c.chart} options={buildOptionsChart(c.chart, true)} />
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
                                <div className="">
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
