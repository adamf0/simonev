import React, { useEffect, useState } from "react";
import Layout from "../../Component/Layout";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import "bootstrap-icons/font/bootstrap-icons.css";
import { v4 as uuidv4 } from "uuid";
import parse from "html-react-parser";
import DOMPurify from "dompurify";

function BankSoalPreview({bankSoal=null, groupPertanyaan, level=null}) {
    console.log(groupPertanyaan)

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

    useEffect(()=> console.log(groupPertanyaans),[groupPertanyaans])

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
                            <li className="breadcrumb-item header-subtitle">Bank Soal</li>
                            <li className="breadcrumb-item header-subtitle">{bankSoal?.judul ?? "unknown"}</li>
                            <li className="breadcrumb-item header-subtitle active">Preview</li>
                        </ol>
                    </nav>
                </div>

                <div className="row">
                    {
                        (bankSoal?.content ?? "").length > 0? 
                        <div className="card col-12">
                            <div className="card-body px-4 py-3 row gap-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(parse(bankSoal?.content ?? "")) }}></div>
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
                                                                <div className="col-12">
                                                                    {index+1}. {item.pertanyaan} {item.required && <small className="text-danger">(wajib isi)</small>}
                                                                </div>
                                                                <div className="col-12">
                                                                    {
                                                                        item.jenis_pilihan=="checkbox" || item.jenis_pilihan=="radio"?
                                                                        <ol key={item.ref} className="list-group list-group-flush">
                                                                            {
                                                                                (item?.template_pilihan??[]).map(pilihan => <li className="list-group-item" key={pilihan.ref}>
                                                                                    <input
                                                                                        data-ref={item.ref} 
                                                                                        type={item.jenis_pilihan=="checkbox"? "checkbox":"radio"} 
                                                                                        className="no-click"
                                                                                        name={`jawaban_pertanyaan_${item.id}`} 
                                                                                        onChange={(e)=>changePilihan(item.ref, pilihan.id, item.jenis_pilihan, pilihan.isFreeText==1? item?.freeText:null)}/> 
                                                                                    &nbsp; &nbsp;
                                                                                    {
                                                                                        pilihan.isFreeText?
                                                                                        <>
                                                                                        <input data-ref={item.ref} 
                                                                                            type="text" 
                                                                                            className={"corm-control"}
                                                                                            placeholder="masukkan jawaban lainnya"
                                                                                            name={`jawaban_pertanyaan_${item.id}_free`} 
                                                                                            value={item?.freeText}
                                                                                            onChange={(e)=>changePilihanFreeText(item.ref, pilihan.id, item.jenis_pilihan, e.target.value)}/>
                                                                                        </>:
                                                                                        pilihan.jawaban
                                                                                    }
                                                                                </li>)
                                                                            }
                                                                        </ol>
                                                                        :
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <b>Sangat Tidak Baik</b> &nbsp;
                                                                            {
                                                                                (item?.template_pilihan??[]).map(pilihan => <div className="row" key={pilihan.ref}>
                                                                                    <center>{pilihan.jawaban}</center>
                                                                                    <input
                                                                                        data-ref={item.ref} 
                                                                                        type={"radio"} 
                                                                                        className="no-click"
                                                                                        name={`jawaban_pertanyaan_${item.id}`} 
                                                                                        onChange={(e)=>changePilihan(item.ref, pilihan.id, item.jenis_pilihan, null)}/>
                                                                                </div>)
                                                                            }
                                                                            &nbsp;<b>Sangat Baik</b>
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
                </div>

                <ToastContainer />
            </Layout>
        </>
    );
}

export default BankSoalPreview;
