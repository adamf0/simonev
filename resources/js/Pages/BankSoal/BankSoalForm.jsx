import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../Component/Layout";
import ErrorList from "../../Component/ErrorList";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import "bootstrap-icons/font/bootstrap-icons.css";
import { UPDATE_BANK_SOAL_FAILURE, UPDATE_BANK_SOAL_SUCCESS, updateBankSoal } from "./redux/actions/bankSoalActions";
import { useDispatch, useSelector } from "react-redux";
import { DtCalendar } from 'react-calendar-datetime-picker'
import 'react-calendar-datetime-picker/dist/style.css'
import { v4 as uuidv4 } from "uuid";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertFromHTML } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { stateToHTML } from "draft-js-export-html";
import parse from "html-react-parser";
import DOMPurify from "dompurify";

const today = new Date();

function splitDate(dateString) {
    if (dateString == null || dateString == undefined) {
        return [ today.getFullYear(), today.getMonth() + 1, today.getDate() ];
    }

    const dateParts = dateString.split('-');
    
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);
  
    return [year, month, day ];
}

function BankSoalForm({typeEvent = "Add", dataBankSoal=null, listUnit=[], listFakultas=[], listProdi=[], listMahahsiswa=[], level=null}) {
    const json = JSON.parse(dataBankSoal?.rule ?? "{}");
    const [yearStart, monthStart, dayStart] = splitDate(json.generate?.start);
    const [yearEnd, monthEnd, dayEnd] = splitDate(json.generate?.end);

    const dispatch = useDispatch();
    const action_type = useSelector((state) => state.bankSoal.action_type);
    const loading = useSelector((state) => state.bankSoal.loading); // Access loading state from Redux
    const errorMessage = useSelector((state) => state.bankSoal.error);
    const validation = useSelector((state) => state.bankSoal.validation);

    const [judul, setJudul] = useState(dataBankSoal?.judul);
    const [deskripsi, setDeskripsi] = useState(dataBankSoal?.deskripsi);

    const [htmlContent, setHtmlContent] = useState(DOMPurify.sanitize(parse(dataBankSoal?.content ?? "")) || "<p></p>");
    const blocksFromHTML = convertFromHTML(htmlContent);
    const contentState = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
    const [editorState, setEditorState] = useState(EditorState.createWithContent(contentState));
    
    
    const [peruntukan, setPeruntukan] = useState(dataBankSoal?.peruntukan);
    // const [rule, setRule] = useState(json);
    const [tipe, setTipe] = useState(json?.type);
    const [target, setTarget] = useState(json?.target_type);
    const [list, setList] = useState(json?.target_list ?? []);
    const [tipeGenerate, setTipeGenerate] = useState(json?.generate?.type);
    const [date, setDate] = useState(null)

    const debounceTimeout = useRef(null);
    const closed = 3000;
    
    const waktuRange = {
        from: { 
            year: yearStart,      // Tahun saat ini
            month: monthStart,    // Bulan saat ini (dimulai dari 0, jadi perlu ditambah 1)
            day: dayStart            // Hari saat ini
        },
        to: {
            year: yearEnd,      // Tahun saat ini
            month: monthEnd,    // Bulan saat ini (dimulai dari 0, jadi perlu ditambah 1)
            day: dayEnd            // Menambahkan 21 hari ke tanggal hari ini
        }
    }
    
    useEffect(()=>{
        if(action_type == UPDATE_BANK_SOAL_SUCCESS){
            toast.success("berhasil simpan template kuesioner", {
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
                window.location.href = `/bankSoal`;
            }, closed);

            return () => clearTimeout(timer);
        }
        if(action_type == UPDATE_BANK_SOAL_FAILURE){
            toast.error(errorMessage?.response?.data?.message, {
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
    },[action_type])

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
      
    const changeTipe = (value) => {
        setTipe(value);  
        if(value=="semua"){
            setTarget(null)
            setList([]);
        }
    };
    function saveHandler(){
        let start = null;
        let end = null;
        if(tipeGenerate=="recursive" && date!=null){
            start = `${date.from.year}-${String(date.from.month).padStart(2, '0')}-${String(date.from.day).padStart(2, '0')}`
            end = `${date.to.year}-${String(date.to.month).padStart(2, '0')}-${String(date.to.day).padStart(2, '0')}`
        } else if(tipeGenerate=="once" && date!=null || date!=undefined){
            start = `${date.from.year}-${String(date.from.month).padStart(2, '0')}-${String(date.from.day).padStart(2, '0')}`
            end = `${date.to.year}-${String(date.to.month).padStart(2, '0')}-${String(date.to.day).padStart(2, '0')}`
        }

        const newRule = {
            "type":tipe,
            "target_type":target,
            "target_list":list,
            "generate":{
                "type":tipeGenerate,
                "start":start,
                "end":end
            }
        };
        dispatch(updateBankSoal(dataBankSoal.id, judul, deskripsi, peruntukan, newRule, DOMPurify.sanitize(htmlContent)));
    }

    function renderOptionListTarget(target) {
        console.log("renderOptionListTarget")
        return useMemo(() => {
            if (target === "npm") {
                // return listMahahsiswa.map(item => (
                //     <option selected={list.includes(item.id)} key={uuidv4()} value={item.id}>{item.id} - {item.nama}</option>
                // ));
                return <></>
            } else if (target === "unit") {
                return listUnit.filter(item => item.unit_kerja.length>0).map(item => (
                    <option selected={list.includes(item.unit_kerja)} key={uuidv4()} value={item.unit_kerja}>{item.unit_kerja}</option>
                ));
            } else if (target === "prodi") {
                return listProdi.map(item => (
                    <option selected={list.includes(item.id)} key={uuidv4()} value={item.id}>{item.id} - {item.nama}</option>
                ));
            }
            return <></>;
        }, [target, listMahahsiswa, listUnit, listProdi, list]);
    }

    const handleEditorChange = (newState) => {
        setEditorState(newState);
        
        // Convert editorState ke HTML
        const html = stateToHTML(newState.getCurrentContent());
        setHtmlContent(html);
    };

    return (
        <>
            <Layout level={level}>
                <div className="header">
                    <h1 className="header-title">
                        Template Kuesioner
                    </h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item header-subtitle"><a href="#">Template Kuesioner</a></li>
                            <li className="breadcrumb-item header-subtitle active">{typeEvent}</li>
                        </ol>
                    </nav>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card flex-fill table-responsive gap-2 px-4 py-3">
                            <div className="row gap-2">
                                <div className="form-floating">
                                    <input type="text" className="form-control" value={judul} onChange={(e)=>setJudul(e.target.value)}/>
                                    <label htmlFor="floatingInput">Judul <b className="text-danger">*</b></label>
                                    <ErrorList errors={validation?.judul} />
                                </div>
                                
                                <div className="form-floating">
                                    <textarea className="form-control" value={deskripsi} onChange={(e)=>setDeskripsi(e.target.value)} style={{"height": "100px"}}></textarea>
                                    <label htmlFor="floatingTextarea2">Deskripsi</label>
                                    <ErrorList errors={validation?.deskripsi} />
                                </div>

                                <div>
                                    <label>Content</label>
                                    <table border={1}>
                                        <Editor
                                            editorState={editorState}
                                            toolbarClassName="toolbarClassName"
                                            wrapperClassName="wrapperClassName"
                                            editorClassName="editorClassName"
                                            onEditorStateChange={handleEditorChange}
                                        />
                                    </table>
                                </div>

                                <div className="form-floating">
                                    <select className="form-select" id="peruntukanSelect" value={peruntukan} onChange={(e)=>setPeruntukan(e.target.value)}>
                                    <option selected=""></option>
                                    <option value="mahasiswa" selected={peruntukan=="mahasiswa"}>Mahasiswa</option>
                                    <option value="dosen" selected={peruntukan=="dosen"}>Dosen</option>
                                    <option value="tendik" selected={peruntukan=="tendik"}>Tendik</option>
                                    </select>
                                    <label htmlFor="peruntukanSelect">Peruntukan <b className="text-danger">*</b></label>
                                    <ErrorList errors={validation?.peruntukan} />
                                </div>
                            </div>
                        </div>

                        <div className="card flex-fill table-responsive gap-2 px-4 py-3">
                            <div className="row">
                                <div className="col-sm-12 col-md-6">
                                    <div className="row gap-3">
                                        <div className="form-floating">
                                            <select className="form-select" id="tipeSelect" value={tipe} onChange={(e)=>changeTipe(e.target.value)} disabled={peruntukan==null || peruntukan=="" || peruntukan == undefined}>
                                            <option selected=""></option>
                                            <option value="spesific" selected={tipe=="spesific"}>Spesifik</option>
                                            <option value="all" selected={tipe=="all"}>Semua</option>
                                            </select>
                                            <label htmlFor="tipeSelect">Tipe <b className="text-danger">*</b></label>
                                            <ErrorList errors={validation?.tipe} />
                                        </div>

                                        <div className="form-floating">
                                            <select className="form-select" id="targetSelect" value={target} onChange={(e)=>setTarget(e.target.value)} disabled={peruntukan==null || peruntukan=="" || peruntukan == undefined || tipe=="semua"}>
                                            <option selected=""></option>
                                            {
                                                peruntukan=="mahasiswa"? 
                                                <>
                                                <option value="npm" selected={target=="npm"}>NPM</option>
                                                <option value="prodi" selected={target=="prodi"}>Prodi</option>
                                                </> :
                                                peruntukan=="dosen"? 
                                                <>
                                                <option value="nidn" selected={target=="nidn"}>NIDN</option>
                                                <option value="prodi" selected={target=="prodi"}>Prodi</option>
                                                </> : 
                                                peruntukan=="tendik"? 
                                                <>
                                                <option value="nip" selected={target=="nip"}>NIDN</option>
                                                <option value="unit" selected={target=="unit"}>Unit</option>
                                                </> : <></>
                                            }
                                            </select>
                                            <label htmlFor="targetSelect">Target {tipe=="spesific"? <b className="text-danger">*</b>:<></>}</label>
                                            <ErrorList errors={validation?.target} />
                                        </div>

                                        <div className="form-floating">
                                            <select className="form-select form-select-default" id="listSelect" value={list} onChange={(e)=>handleListSelectChange(e)} disabled={peruntukan==null || peruntukan=="" || peruntukan == undefined || tipe=="semua"} multiple>
                                            <option value="" selected={list.includes("")}></option>
                                            <option value="all" selected={list.includes("all")}>Semua Target</option>
                                            {renderOptionListTarget(target)}
                                            </select>
                                            <label htmlFor="listSelect">List Target {tipe=="spesific"? <b className="text-danger">*</b>:<></>}</label>
                                            <ErrorList errors={validation?.list} />
                                        </div>

                                        <div className="form-floating">
                                            <select className="form-select" id="tipeGenerateSelect" value={tipeGenerate} onChange={(e)=>setTipeGenerate(e.target.value)} disabled={peruntukan==null || peruntukan=="" || peruntukan == undefined}>
                                            <option value="" selected={tipeGenerate==""}></option>
                                            <option value="recursive" selected={tipeGenerate=="recursive"}>Rekursif</option>
                                            <option value="once" selected={tipeGenerate=="once"}>Sekali</option>
                                            <option value="nolimit" selected={tipeGenerate=="nolimit"}>nolimit</option>
                                            </select>
                                            <label htmlFor="tipeGenerateSelect">Tipe Generate <b className="text-danger">*</b></label>
                                            <ErrorList errors={validation?.tipeGenerate} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-12 col-md-6">
                                    {
                                        tipeGenerate=="nolimit"? 
                                        <></> :
                                        <>
                                        <label>Waktu <b className="text-danger">*</b></label>
                                        {
                                            tipeGenerate=="sekali"? 
                                            <DtCalendar
                                                key={"sekali"}
                                                onChange={setDate}
                                                showWeekend
                                                type={'single'}
                                            />:
                                            <DtCalendar
                                                key={"recursive"}
                                                onChange={setDate}
                                                initValue={waktuRange}
                                                showWeekend
                                                type={'range'}
                                            />
                                        }
                                        </>
                                    }
                                </div>
                            </div>
                            <div>
                                <button className="btn btn-outline-primary d-flex align-items-center gap-2" type="button" onClick={()=>saveHandler()} disabled={loading}>
                                    {loading? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>:<></>}
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <ToastContainer />
            </Layout>
        </>
    );
}

export default BankSoalForm;
