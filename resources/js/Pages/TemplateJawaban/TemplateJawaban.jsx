import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FETCH_TEMPLATE_JAWABANS_REQUEST, FETCH_TEMPLATE_JAWABANS_FAILURE, FETCH_TEMPLATE_JAWABANS_SUCCESS} from "../TemplateJawaban/redux/actions/templateJawabanActions";

function TemplateJawaban({templateJawabans, action_type_jawaban, loading_jawaban, updateJawabanHandler, deleteJawabanHandler, changeJawaban, changeNilai}) {
    return <ul className="list-group">
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
                                </ul>;
}

TemplateJawaban.LoadingRow = () => {
    return (
        <li className="list-group-item">memuat data...</li>
    );
};

TemplateJawaban.ErrorRow = ({ onRefresh }) => {
    return (
        <li className="list-group-item">
            <button className="btn btn-primary" onClick={onRefresh}>refresh</button>
        </li>
    );
};
function convertIndexToLetter(index) {
    let result = "";
    while (index > 0) {
        index--; // Sesuaikan ke 0-based
        result = String.fromCharCode(97 + (index % 26)) + result;
        index = Math.floor(index / 26);
    }
    return result;
}
TemplateJawaban.ListRow = ({ templateJawabans, loadingJawaban, updateJawabanHandler, deleteJawabanHandler, changeJawabanHandler, changeNilaiHandler }) => {
    return (
        (templateJawabans?.record ?? []).map((item, index) => (
            <li className="list-group-item" key={item.id}>
                <div className="d-flex flex-row align-items-center gap-2">
                    <div className="form-floating w-75">
                        <input type="text" className="form-control" disabled={item.isFreeText==1} value={item.jawaban} onChange={(e)=>changeJawabanHandler(index,e.target.value)}/>
                        <label htmlhtmlFor="floatingInput">Jawaban {convertIndexToLetter(index+1)}</label>
                    </div>
                    <div className="form-floating w-20">
                        <input type="text" className="form-control" value={item.nilai} onChange={(e)=>changeNilaiHandler(index,e.target.value)}/>
                        <label htmlhtmlFor="floatingInput">Nilai</label>
                    </div>
                    <div className="d-grid gap-2">
                        <button 
                            className="btn btn-outline-primary d-flex align-items-center gap-2" 
                            type="button" 
                            disabled={loadingJawaban} 
                            onClick={() => updateJawabanHandler(item.id, item.jawaban, item.nilai)}
                        >
                            {loadingJawaban ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : null}
                            {!loadingJawaban? <i class="bi bi-check-circle"></i>:<></>}
                        </button>
                        {
                            item.isFreeText!=1?
                            <button 
                                className="btn btn-outline-danger d-flex align-items-center gap-2" 
                                type="button" 
                                disabled={loadingJawaban} 
                                onClick={() => deleteJawabanHandler(item.id)}
                            >
                                {loadingJawaban ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : null}
                                {!loadingJawaban? <i class="bi bi-x-circle"></i>:<></>}
                            </button> : 
                            <></>
                        }
                    </div>
                </div>
            </li>
        ))
    );
};




export default TemplateJawaban;
