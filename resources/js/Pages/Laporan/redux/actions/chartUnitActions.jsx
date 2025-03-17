import axios from 'axios';

export const FETCH_CHART_UNIT_REQUEST = 'FETCH_CHART_UNIT_REQUEST';
export const FETCH_CHART_UNIT_SUCCESS = 'FETCH_CHART_UNIT_SUCCESS';
export const FETCH_CHART_UNIT_FAILURE = 'FETCH_CHART_UNIT_FAILURE';

const api_chart_unit = '/api/kuesioner/chart';

export const fetchChartUnit = (id_bank_soal, type="unit") => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CHART_UNIT_REQUEST });
    try {
      const response = await axios.get(`${api_chart_unit}/${id_bank_soal}/${type}`);
      dispatch({ type: FETCH_CHART_UNIT_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_CHART_UNIT_FAILURE, error });
    }
  };
};