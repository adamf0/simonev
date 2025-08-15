import axios from 'axios';

export const FETCH_CHART_PRODI_LABEL_REQUEST = 'FETCH_CHART_PRODI_LABEL_REQUEST';
export const FETCH_CHART_PRODI_LABEL_SUCCESS = 'FETCH_CHART_PRODI_LABEL_SUCCESS';
export const FETCH_CHART_PRODI_LABEL_FAILURE = 'FETCH_CHART_PRODI_LABEL_FAILURE';

const api_chart_prodi = '/api/kuesioner/chartlabel';

export const fetchChartProdiLabel = (id_bank_soal, type="prodi") => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CHART_PRODI_LABEL_REQUEST });
    try {
      const response = await axios.get(`${api_chart_prodi}/${id_bank_soal}/${type}`);
      dispatch({ type: FETCH_CHART_PRODI_LABEL_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_CHART_PRODI_LABEL_FAILURE, error });
    }
  };
};