import axios from 'axios';

export const FETCH_CHART_FAKULTAS_LABEL_REQUEST = 'FETCH_CHART_FAKULTAS_LABEL_REQUEST';
export const FETCH_CHART_FAKULTAS_LABEL_SUCCESS = 'FETCH_CHART_FAKULTAS_LABEL_SUCCESS';
export const FETCH_CHART_FAKULTAS_LABEL_FAILURE = 'FETCH_CHART_FAKULTAS_LABEL_FAILURE';

const api_chart_fakultas = '/api/kuesioner/chartlabel';

export const fetchChartFakultasLabel = (id_bank_soal, type="fakultas") => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CHART_FAKULTAS_LABEL_REQUEST });
    try {
      const response = await axios.get(`${api_chart_fakultas}/${id_bank_soal}/${type}`);
      dispatch({ type: FETCH_CHART_FAKULTAS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_CHART_FAKULTAS_LABEL_FAILURE, error });
    }
  };
};