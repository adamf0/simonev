import React, { useEffect, useRef, useState } from "react";
import Layout from "../../Component/Layout";
import ErrorList from "../../Component/ErrorList";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import "bootstrap-icons/font/bootstrap-icons.css";
import { ADD_TEMPLATE_PERTANYAAN_FAILURE, ADD_TEMPLATE_PERTANYAAN_SUCCESS, addTemplatePertanyaan, UPDATE_TEMPLATE_PERTANYAAN_FAILURE, UPDATE_TEMPLATE_PERTANYAAN_SUCCESS, updateTemplatePertanyaan } from "./redux/actions/templatePertanyaanActions";
import { fetchTemplateJawabans, addTemplateJawaban, deleteTemplateJawaban, ADD_TEMPLATE_JAWABAN_SUCCESS, DELETE_TEMPLATE_JAWABAN_SUCCESS, FETCH_TEMPLATE_JAWABANS_REQUEST, FETCH_TEMPLATE_JAWABANS_FAILURE, updateTemplateJawaban, FETCH_TEMPLATE_JAWABANS_SUCCESS, setTemplateJawabans, UPDATE_TEMPLATE_JAWABAN_SUCCESS, ADD_TEMPLATE_JAWABAN_FAILURE, UPDATE_TEMPLATE_JAWABAN_FAILURE, DELETE_TEMPLATE_JAWABAN_FAILURE } from "../TemplateJawaban/redux/actions/templateJawabanActions";
import { useDispatch, useSelector } from "react-redux";
import TemplateJawaban from "../TemplateJawaban/TemplateJawaban";

function TemplatePertanyaanForm({type="Add",bankSoal,templatePertanyaan, listKategori = [], level=null, hasFreeText=false}) {
    const dispatch = useDispatch();
    const [hasFree, setHasFree] = useState(hasFreeText);
    const action_type_pertanyaan = useSelector((state) => state.templatePertanyaan.action_type);
    const loading_pertanyaan = useSelector((state) => state.templatePertanyaan.loading); 
    const errorMessage_pertanyaan = useSelector((state) => state.templatePertanyaan.error);
    const validation_pertanyaan = useSelector((state) => state.templatePertanyaan.validation);
    const current_id = useSelector((state) => state.templatePertanyaan.current_id);

    const [pertanyaan, setPertanyaan] = useState(templatePertanyaan?.pertanyaan);
    const [jenisPilihan, setJenisPilihan] = useState(templatePertanyaan?.jenis_pilihan);
    const [bobot, setBobot] = useState(templatePertanyaan?.bobot);
    const [kategori, setKategori] = useState(templatePertanyaan?.id_kategori);
    const [subKategori, setSubKategori] = useState(templatePertanyaan?.id_sub_kategori);
    const [listSubKategori, setListSubKategori] = useState([]);

    const templateJawabans = useSelector((state) => state.templateJawaban.templateJawabans);
    const action_type_jawaban = useSelector((state) => state.templateJawaban.action_type);
    const loading_jawaban = useSelector((state) => state.templateJawaban.loading); 
    const errorMessage_jawaban = useSelector((state) => state.templateJawaban.error);
    const validation_jawaban = useSelector((state) => state.templateJawaban.validation);

    const debounceTimeout = useRef(null);
    const closed = 3000;
    
    useEffect(()=>{
        if(action_type_pertanyaan == ADD_TEMPLATE_PERTANYAAN_SUCCESS){
            toast.success("berhasil simpan template pertanyaan", {
                position: "bottom-right",
                autoClose: closed,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });

            const timer = setTimeout(() => {
                window.location.href = `/bankSoal/${bankSoal.id}/pertanyaan/${current_id}/edit`;
            }, closed);

            return () => clearTimeout(timer);
        }

        if(action_type_pertanyaan == UPDATE_TEMPLATE_PERTANYAAN_SUCCESS){
            toast.success("berhasil simpan template pertanyaan", {
                position: "bottom-right",
                autoClose: closed,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }

        if(action_type_pertanyaan == ADD_TEMPLATE_PERTANYAAN_FAILURE || action_type_pertanyaan == UPDATE_TEMPLATE_PERTANYAAN_FAILURE){
            toast.error(errorMessage_pertanyaan?.response?.data?.message, {
                position: "bottom-right",
                autoClose: closed,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    },[action_type_pertanyaan])

    useEffect(()=>{
        console.log("loading:",loading_jawaban);
        console.log("action_type:",action_type_jawaban);
    
        if(action_type_jawaban==ADD_TEMPLATE_JAWABAN_SUCCESS || action_type_jawaban==UPDATE_TEMPLATE_JAWABAN_SUCCESS || action_type_jawaban==DELETE_TEMPLATE_JAWABAN_SUCCESS){
            dispatch(fetchTemplateJawabans(templatePertanyaan.id));
        }
        if(action_type_jawaban==ADD_TEMPLATE_JAWABAN_FAILURE || action_type_jawaban==UPDATE_TEMPLATE_JAWABAN_FAILURE || action_type_jawaban==DELETE_TEMPLATE_JAWABAN_FAILURE){
            toast.error(errorMessage_jawaban?.response?.data?.message, {
                position: "bottom-right",
                autoClose: closed,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    },[loading_jawaban,action_type_jawaban])
    
    useEffect(() => {
        if(type=="Edit"){
            dispatch(fetchTemplateJawabans(templatePertanyaan.id));
        }
    }, []);

    useEffect(() => {
        const selectedKategori = listKategori.filter(k => k.id == kategori)
        if (selectedKategori.length > 0) {
            setListSubKategori(selectedKategori[0]?.sub_kategori ?? []);
        } else {
            setListSubKategori([]);
        }
    }, [kategori])

    const changePertanyaan = (value) => {
          setPertanyaan(value);  
    };
    const changeJenisPilihan = (value) => {
        setJenisPilihan(value);  
    };
    const changeKategori = (value) => {
        setKategori(value);  
    };
    const changeSubKategori = (value) => {
        setSubKategori(value);  
    };
    const changeBobot = (value) => {
        setBobot(value);  
    };

    function saveHandler(){
        if(type=="Add"){
            dispatch(addTemplatePertanyaan(bankSoal?.id, pertanyaan, jenisPilihan, bobot, kategori, subKategori));
        } else{
            dispatch(updateTemplatePertanyaan(templatePertanyaan?.id, bankSoal?.id, pertanyaan, jenisPilihan, bobot, kategori, subKategori));
        }
    }

    function countEmptyJawabanInput() {
        return (templateJawabans?.record ?? []).filter(item => (item.jawaban=="" || item.nilai=="") || (item.jawaban==null || item.nilai==null) || (item.jawaban==undefined || item.nilai==undefined) ).length;
    }    
    function createJawabanHandler(){
        if(countEmptyJawabanInput()){
            toast.error("jawaban atau nilai masih ada yg kosong", {
                position: "bottom-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        } else{
            dispatch(addTemplateJawaban(templatePertanyaan?.id, null));
        }
    }
    function createJawabanFreeTextHandler(event){
        dispatch(addTemplateJawaban(templatePertanyaan?.id, event.target.checked? 1:0));
    }
    function updateJawabanHandler(id, jawaban, nilai){
        dispatch(updateTemplateJawaban(id, templatePertanyaan?.id, jawaban, nilai));
    }
    function deleteJawabanHandler(id) {
        dispatch(deleteTemplateJawaban(id)); // Dispatch delete action
    }
    const changeJawaban = (index, value) => {
        const update = templateJawabans.record.map((item, i) =>
            i === index ? { ...item, jawaban: value } : item
        );
        dispatch(setTemplateJawabans(update));
    };
    const changeNilai = (index, value) => {
        const update = templateJawabans.record.map((item, i) =>
            i === index ? { ...item, nilai: value } : item
        );
        dispatch(setTemplateJawabans(update));
    };
    
    useEffect(()=>{
        console.log(templateJawabans)
        if(templateJawabans!=null && templateJawabans.length>0){
            const check = templateJawabans.filter(jawaban => jawaban.isFreeText == 1);
            console.log(check)
            setHasFree(check.length>0);
        }
    },[templateJawabans])
    return (
        <>
            <Layout level={level}>
                <div className="header">
                    <h1 className="header-title">
                        Template Pertanyaan
                    </h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item header-subtitle"><a href="#">Template Kuesioner</a></li>
                            <li className="breadcrumb-item header-subtitle active"><a href={`/bankSoal/${bankSoal?.id}/pertanyaan`} className="breadcrumb-item header-subtitle active">{bankSoal?.judul}</a></li>
                            <li className="breadcrumb-item header-subtitle active">{type}</li>
                        </ol>
                    </nav>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card flex-fill table-responsive gap-2 px-4 py-3">
                            <div className="card-header">
                                <h5 className="card-title mb-0">Data Pertanyaan</h5>
                            </div>
                            <div className="row gap-2">
                                <div className="form-floating">
                                    <input type="text" className="form-control" value={pertanyaan} onChange={(e)=>changePertanyaan(e.target.value)}/>
                                    <label htmlFor="floatingInput">Pertanyaan <b className="text-danger">*</b></label>
                                    <ErrorList errors={validation_pertanyaan?.pertanyaan} />
                                </div>
                                
                                <div className="form-floating">
                                    <select className="form-select" id="jenisPilihanSelect" value={jenisPilihan} onChange={(e)=>changeJenisPilihan(e.target.value)}>
                                    <option selected=""></option>
                                    <option value="radio" selected={jenisPilihan=="radio"}>Pilihan Ganda</option>
                                    <option value="checkbox" selected={jenisPilihan=="checkbox"}>Pilih Banyak</option>
                                    <option value="rating5" selected={jenisPilihan=="rating5"}>Rating 5 Pilihan</option>
                                    </select>
                                    <label htmlFor="jenisPilihanSelect">Jenis Pilihan <b className="text-danger">*</b></label>
                                    <ErrorList errors={validation_pertanyaan?.jenisPilihan} />
                                </div>

                                <div className="form-floating">
                                    <input type="number" className="form-control" step={0.1} value={bobot} onChange={(e)=>changeBobot(e.target.value)}/>
                                    <label htmlFor="floatingInput">Bobot <b className="text-danger">*</b></label>
                                    <ErrorList errors={validation_pertanyaan?.bobot} />
                                </div>

                                <div className="form-floating">
                                    <select className="form-select" id="jenisKategoriSelect" value={kategori} onChange={(e)=>changeKategori(e.target.value)}>
                                    <option selected=""></option>
                                    {
                                        listKategori.map(lk => <option value={lk.id} selected={lk.id==kategori}>{lk.nama_kategori}</option>)
                                    }
                                    </select>
                                    <label htmlFor="jenisKategoriSelect">Kategori <b className="text-danger">*</b></label>
                                    <ErrorList errors={validation_pertanyaan?.kategori} />
                                </div>

                                <div className="form-floating">
                                    <select className="form-select" id="jenisSubKategoriSelect" value={subKategori} onChange={(e)=>changeSubKategori(e.target.value)}>
                                    <option selected=""></option>
                                    {
                                        listSubKategori.map(lsk => <option value={lsk.id} selected={lsk.id==subKategori}>{lsk.nama_sub}</option>)
                                    }
                                    </select>
                                    <label htmlFor="jenisSubKategoriSelect">Sub Kategori <b className="text-danger">*</b></label>
                                    <ErrorList errors={validation_pertanyaan?.subKategori} />
                                </div>

                                <div>
                                    <button className="btn btn-outline-primary d-flex align-items-center gap-2" type="button" disabled={loading_pertanyaan}  onClick={()=>saveHandler()}>
                                        {loading_pertanyaan? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>:<></>}
                                        Lanjut
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {
                        type=="Edit" && ["radio","checkbox"].includes(jenisPilihan)? 
                        <div className="col-12">
                        <div className="card flex-fill table-responsive gap-2 px-4 py-3">
                            <div className="card-header d-flex justify-content-between flex-wrap">
                                <h5 className="card-title mb-0">
                                    Data Jawaban <b className="text-danger">*</b><br />
                                    <small>Pilih jawaban benarnya </small>
                                </h5>
                                <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2" type="button" disabled={loading_jawaban} onClick={()=>createJawabanHandler()}>
                                    {loading_jawaban? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>:<></>}
                                    {!loading_jawaban? <i className="bi bi-plus"></i>:<></>}
                                </button>
                            </div>
                            <div className="row gap-2">
                                {
                                    jenisPilihan=="checkbox"? 
                                    <div className="">
                                        <input type="checkbox" checked={hasFree} value={1} onChange={createJawabanFreeTextHandler}/> tambah input free text
                                    </div> : 
                                    <></>
                                }
                                <ul className="list-group">
                                    {action_type_jawaban === FETCH_TEMPLATE_JAWABANS_REQUEST && <TemplateJawaban.LoadingRow />}
                                    {action_type_jawaban === FETCH_TEMPLATE_JAWABANS_FAILURE && <TemplateJawaban.ErrorRow onRefresh={()=>{}} />}
                                    {action_type_jawaban === FETCH_TEMPLATE_JAWABANS_SUCCESS && 
                                        <TemplateJawaban.ListRow 
                                            templateJawabans={templateJawabans} 
                                            loadingJawaban={loading_jawaban} 
                                            updateJawabanHandler={updateJawabanHandler} 
                                            deleteJawabanHandler={deleteJawabanHandler}
                                            changeJawabanHandler={changeJawaban}
                                            changeNilaiHandler={changeNilai}
                                        />
                                    }
                                </ul>                             
                            </div>
                        </div>
                    </div> : <></>
                    }
                </div>

                <ToastContainer />
            </Layout>
        </>
    );
}

export default TemplatePertanyaanForm;
