import axios from 'axios';

export const FETCH_LAPORANS_REQUEST = 'FETCH_REKAP_REQUEST';
export const FETCH_LAPORANS_SUCCESS = 'FETCH_REKAP_SUCCESS';
export const FETCH_LAPORANS_FAILURE = 'FETCH_REKAP_FAILURE';

const api_laporan_list = '/api/kuesioner/laporan';

export const fetchLaporans = (filters, page = 1) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_LAPORANS_REQUEST });
    try {
      const response = await axios.get(api_laporan_list, { params: { ...filters, page } });
      dispatch({ type: FETCH_LAPORANS_SUCCESS, payload: response.data.data });
    } catch (error) {
      dispatch({ type: FETCH_LAPORANS_FAILURE, error });
    }
  };
};