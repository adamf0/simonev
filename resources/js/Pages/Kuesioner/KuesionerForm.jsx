import React, { useEffect, useRef, useState } from "react";
import Layout from "../../Component/Layout";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import "bootstrap-icons/font/bootstrap-icons.css";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_KUESIONER_FAILURE, UPDATE_KUESIONER_REQUEST, UPDATE_KUESIONER_SUCCESS, updateKuesioner } from "./redux/actions/kuesionerActions";
import parse from "html-react-parser";
import DOMPurify from "dompurify";

function KuesionerForm({kuesioner, groupPertanyaan, level=null, mode="start"}) {
    const dispatch = useDispatch();
    const action_type = useSelector((state) => state.kuesioner.action_type);
    const errorMessage = useSelector((state) => state.kuesioner.error);
    const loading = useSelector((state) => state.kuesioner.loading); // Access loading state from Redux

    const [groupPertanyaans, setGroupPertanyaans] = useState(
        Object.fromEntries(
            Object.entries(groupPertanyaan).map(([group, pertanyaan]) => [
                group,
                pertanyaan.map(item => ({
                    ...item,
                    ref: uuidv4(),
                    template_pilihan: item.template_pilihan?.map(pilihan => ({
                        ...pilihan,
                        ref: uuidv4(),
                    })) ?? []
                }))
            ])
        )
    );    

    useEffect(()=>{
            console.log("loading:",loading);
            console.log("action_type:",action_type);
    
            if(action_type==UPDATE_KUESIONER_SUCCESS){
                toast.success("berhasil simpan kueioner", {
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
            if(action_type==UPDATE_KUESIONER_FAILURE){
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

    useEffect(()=> console.log(groupPertanyaans),[groupPertanyaans])

    function changePilihan(ref, id_template_pilihan, jenis_pilihan, freeText) {
        setGroupPertanyaans((prev) => {
            const newData = { ...prev };
    
            Object.keys(newData).forEach((kategori) => {
                newData[kategori] = newData[kategori].map((pertanyaan) => {
                    if (pertanyaan.ref === ref) {
                        if (jenis_pilihan === "checkbox") {
                            const isSelected = pertanyaan.selected.includes(id_template_pilihan);
                            return {
                                ...pertanyaan,
                                freeText: freeText,
                                selected: isSelected
                                    ? pertanyaan.selected.filter((id) => id !== id_template_pilihan)
                                    : [...pertanyaan.selected, id_template_pilihan], 
                            };
                        } else {
                            return {
                                ...pertanyaan,
                                freeText: freeText,
                                selected: [id_template_pilihan],
                            };
                        }
                    }
                    return pertanyaan;
                });
            });
    
            return newData;
        });
    }    
    
    function saveHandler() {
        const data = Object.values(groupPertanyaans) 
                    .flat() 
                    .filter(item => Array.isArray(item.selected) && item.selected.length > 0) 
                    .flatMap(item => {
                        const getFreeText = item.template_pilihan.find(pilihan => pilihan.isFreeText === 1);
                        const freeText = getFreeText && item.selected.includes(getFreeText.id) ? item?.freetext : null;

                        return item.selected.map(id_pilihan => ({
                            id_kuesioner: kuesioner.id,
                            id_template_pertanyaan: item.id,
                            id_template_pilihan: id_pilihan,
                            freeText: id_pilihan === getFreeText?.id ? freeText : null
                        }))
                    });
    
        console.log(data);
        dispatch(updateKuesioner("update", kuesioner.id, data))
    }
    

    function renderHeaderCard(groups){
        const group = groups.split("||").filter(item => {
            if(item.trim() !== "" || item==null || item==undefined){
                return item
            }
        });

        if(group.length==2){
            return `${group[0]} > ${group[1]}`;
        } else if(group.length==1){
            return `${group[0]}`;
        }
        return "";
    }

    console.log(groupPertanyaans)

    return (
        <>
            <Layout level={level}>
                <div className="header">
                    <h1 className="header-title">
                        Kuesioner
                    </h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item header-subtitle">Kuesioner</li>
                            <li className="breadcrumb-item header-subtitle">{kuesioner?.bank_soal?.judul ?? "Unknown"}</li>
                        </ol>
                    </nav>
                </div>

                <div className="row">
                    {
                        (kuesioner?.bank_soal?.content ?? "").length > 0? 
                        <div className="card col-12">
                            <div className="card-body px-4 py-3 row gap-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(parse(kuesioner?.bank_soal?.content ?? "")) }}></div>
                        </div> : <></>
                    }
                    {
                        Object.entries(groupPertanyaans).map(([group, pertanyaan]) => {
                            return <div className="col-12">
                                        <div className="card flex-fill">
                                            <div className="card-header bg-primary text-white">
                                                {renderHeaderCard(group)}
                                            </div>
                                            <div className="card-body px-4 py-3 row gap-2">
                                                {
                                                    Object.values(pertanyaan).map((item,index) => 
                                                        <div className="col-12">
                                                            <div className="row">
                                                                <div className="col-12">{index+1}. {item.pertanyaan}</div>
                                                                <div className="col-12">
                                                                    {
                                                                        item.jenis_pilihan=="checkbox" || item.jenis_pilihan=="radio"?
                                                                        <ol key={item.ref} type="A">
                                                                            {
                                                                                (item?.template_pilihan??[]).map(pilihan => <li key={pilihan.ref}>
                                                                                    <input
                                                                                        data-ref={item.ref} 
                                                                                        type={item.jenis_pilihan=="checkbox"? "checkbox":"radio"} 
                                                                                        checked={ item.selected.some(id => id === pilihan.id) } 
                                                                                        className={mode != "start"? "no-click":""}
                                                                                        name={`jawaban_pertanyaan_${item.id}`} 
                                                                                        onChange={(e)=>changePilihan(item.ref, pilihan.id, item.jenis_pilihan, null)}/> 
                                                                                    {
                                                                                        pilihan.isFreeText?
                                                                                        <>
                                                                                        <input data-ref={item.ref} 
                                                                                            type="text" 
                                                                                            className={"corm-control"}
                                                                                            placeholder="masukkan jawaban lainnya"
                                                                                            name={`jawaban_pertanyaan_${item.id}_free`} 
                                                                                            onChange={(e)=>changePilihan(item.ref, pilihan.id, item.jenis_pilihan, e.target.value)}/>
                                                                                        </>:
                                                                                        pilihan.jawaban
                                                                                    }
                                                                                </li>)
                                                                            }
                                                                        </ol>
                                                                        :
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <b>Sangat Tidak Baik</b>
                                                                            {
                                                                                (item?.template_pilihan??[]).map(pilihan => <div className="row" key={pilihan.ref}>
                                                                                    <center>{pilihan.jawaban}</center>
                                                                                    <input
                                                                                        data-ref={item.ref} 
                                                                                        type={"radio"} 
                                                                                        checked={ item.selected.some(id => id === pilihan.id) } 
                                                                                        className={mode != "start"? "no-click":""}
                                                                                        name={`jawaban_pertanyaan_${item.id}`} 
                                                                                        onChange={(e)=>changePilihan(item.ref, pilihan.id, item.jenis_pilihan, null)}/>
                                                                                </div>)
                                                                            }
                                                                            <b>Sangat Baik</b>
                                                                        </div>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                        })
                    }
                    {
                        mode=="start"?
                        <div className="card flex-fill table-responsive gap-2 px-4 py-3">
                            <div>
                                <button className="btn btn-outline-primary d-flex align-items-center gap-2" type="button" onClick={()=>saveHandler()} disabled={action_type==UPDATE_KUESIONER_REQUEST}>
                                    Simpan
                                </button>
                            </div>
                        </div> : 
                        <></>
                    }
                    
                </div>

                <ToastContainer />
            </Layout>
        </>
    );
}

export default KuesionerForm;
