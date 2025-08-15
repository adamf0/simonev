import axios from 'axios';

export const FETCH_CHART_REQUEST = 'FETCH_CHART_REQUEST';
export const FETCH_CHART_SUCCESS = 'FETCH_CHART_SUCCESS';
export const FETCH_CHART_FAILURE = 'FETCH_CHART_FAILURE';

const api_chart = '/api/kuesioner/chart';

export const fetchChartTotal = (id_bank_soal) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CHART_REQUEST });
    try {
      const response = await axios.get(`${api_chart}/${id_bank_soal}`);
      dispatch({ type: FETCH_CHART_FAKULTAS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_CHART_FAILURE, error });
    }
  };
};