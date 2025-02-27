import axios from 'axios';

export const FETCH_REKAPS_REQUEST = 'FETCH_REKAP_REQUEST';
export const FETCH_REKAPS_SUCCESS = 'FETCH_REKAP_SUCCESS';
export const FETCH_REKAPS_FAILURE = 'FETCH_REKAP_FAILURE';

const api_rekapkuesioner_list = '/api/kuesioner/rekap';

export const fetchRekapKuesioners = (filters, page = 1) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_REKAPS_REQUEST });
    try {
      const response = await axios.get(api_rekapkuesioner_list, { params: { ...filters, page } });
      dispatch({ type: FETCH_REKAPS_SUCCESS, payload: response.data.data });
    } catch (error) {
      dispatch({ type: FETCH_REKAPS_FAILURE, error });
    }
  };
};