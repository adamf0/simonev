import axios from 'axios';

export const FETCH_CHART_PRODI_REQUEST = 'FETCH_CHART_PRODI_REQUEST';
export const FETCH_CHART_PRODI_SUCCESS = 'FETCH_CHART_PRODI_SUCCESS';
export const FETCH_CHART_PRODI_FAILURE = 'FETCH_CHART_PRODI_FAILURE';

const api_chart_prodi = '/api/kuesioner/chart';

export const fetchChartProdi = (id_bank_soal, type="prodi") => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CHART_PRODI_REQUEST });
    try {
      const response = await axios.get(`${api_chart_prodi}/${id_bank_soal}/${type}`);
      dispatch({ type: FETCH_CHART_PRODI_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_CHART_PRODI_FAILURE, error });
    }
  };
};