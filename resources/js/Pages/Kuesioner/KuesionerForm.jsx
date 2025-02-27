import React, { useEffect, useRef, useState } from "react";
import Layout from "../../Component/Layout";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import "bootstrap-icons/font/bootstrap-icons.css";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_KUESIONER_FAILURE, UPDATE_KUESIONER_REQUEST, UPDATE_KUESIONER_SUCCESS, updateKuesioner } from "./redux/actions/kuesionerActions";
import { format } from "date-fns";

function KuesionerForm({kuesioner, dataPertanyaan, level=null, mode="start"}) {
    const dispatch = useDispatch();
    const action_type = useSelector((state) => state.kuesioner.action_type);
    const errorMessage = useSelector((state) => state.kuesioner.error);
    const loading = useSelector((state) => state.kuesioner.loading); // Access loading state from Redux

    const [pertanyaan, _] = useState(
        dataPertanyaan.map(item => ({
            ...item,
            ref: uuidv4(),
        }))
        
    );

    const [form, setForm] = useState(
        pertanyaan.flatMap(item => 
            item?.template_pilihan?.length > 0
                ? item.template_pilihan.map(pilihan => ({
                    id_kuesioner: kuesioner?.id ?? "",
                    id_template_pertanyaan: item?.id ?? "",
                    id_template_pilihan: pilihan?.id ?? null,
                    selected: item.selected.includes(pilihan.id),
                    ref: item.ref,
                }))
                : [{
                    id_kuesioner: kuesioner?.id ?? "",
                    id_template_pertanyaan: item?.id ?? "",
                    id_template_pilihan: null,
                    selected: false,
                    ref: item.ref,
                }]
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

    useEffect(()=> console.log(form),[form])

    function changePilihan(ref, id_template_pilihan, jenis_pilihan) {
        setForm(prevForm =>
            jenis_pilihan=="checkbox"? 
            prevForm.map(item =>
                item.ref === ref && item.id_template_pilihan === id_template_pilihan
                    ? { ...item, selected: !item.selected }
                    : item
            ) : 
            prevForm.map(item =>
                item.ref === ref
                    ? { ...item, selected: false }
                    : item
            )
            .map(item =>
                item.ref === ref && item.id_template_pilihan === id_template_pilihan
                    ? { ...item, selected: !item.selected }
                    : item
            )
        );
    }
    
    function saveHandler(){
        const data = form
            .filter(item => item.selected === true)
            .map(({ selected, ref, ...rest }) => rest); 

        dispatch(updateKuesioner("update", kuesioner.id,data))
    }
    return (
        <>
            <Layout level={level}>
                <div className="header">
                    <h1 className="header-title">
                        Kuesioner
                    </h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item header-subtitle"><a href="#">Kuesioner</a></li>
                            <li className="breadcrumb-item header-subtitle active">{format(new Date(kuesioner.start_repair), "dd MMM yyyy")} - {format(new Date(kuesioner.end_repair), "dd MMM yyyy")}</li>
                        </ol>
                    </nav>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card flex-fill px-4 py-3">
                            <div className="row gap-2">
                                {
                                    pertanyaan.map((item,index) => 
                                        <div className="col-12">
                                            <div className="row">
                                                <div className="col-12">{index+1}. {item.pertanyaan}</div>
                                                <div className="col-12">
                                                    <ol type="A">
                                                    {
                                                        (item?.template_pilihan??[]).map(pilihan => 
                                                        <li>
                                                            <input
                                                                data-ref={item.ref} 
                                                                type={item.jenis_pilihan=="checkbox"? "checkbox":"radio"} 
                                                                checked={ form.some(f => f.id_template_pilihan === pilihan.id && f.selected) } 
                                                                className={mode != "start"? "no-click":""}
                                                                name={`jawaban_pertanyaan_${item.id}`} 
                                                                onChange={(e)=>changePilihan(item.ref, pilihan.id, item.jenis_pilihan)}/> {pilihan.jawaban}
                                                        </li>)
                                                    }
                                                    </ol>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>

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
                </div>

                <ToastContainer />
            </Layout>
        </>
    );
}

export default KuesionerForm;
