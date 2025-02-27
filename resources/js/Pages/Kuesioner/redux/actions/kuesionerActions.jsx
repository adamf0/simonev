import axios from 'axios';

export const FETCH_KUESIONERS_REQUEST = 'FETCH_KUESIONERS_REQUEST';
export const FETCH_KUESIONERS_SUCCESS = 'FETCH_KUESIONERS_SUCCESS';
export const FETCH_KUESIONERS_FAILURE = 'FETCH_KUESIONERS_FAILURE';

export const ADD_KUESIONER_REQUEST = 'ADD_KUESIONER_REQUEST';
export const ADD_KUESIONER_SUCCESS = 'ADD_KUESIONER_SUCCESS';
export const ADD_KUESIONER_FAILURE = 'ADD_KUESIONER_FAILURE';

export const UPDATE_KUESIONER_REQUEST = 'UPDATE_KUESIONER_REQUEST';
export const UPDATE_KUESIONER_SUCCESS = 'UPDATE_KUESIONER_SUCCESS';
export const UPDATE_KUESIONER_FAILURE = 'UPDATE_KUESIONER_FAILURE';

export const DELETE_KUESIONER_REQUEST = 'DELETE_KUESIONER_REQUEST';
export const DELETE_KUESIONER_SUCCESS = 'DELETE_KUESIONER_SUCCESS';
export const DELETE_KUESIONER_FAILURE = 'DELETE_KUESIONER_FAILURE';

export const SET_KUESIONERS = 'SET_KUESIONERS';

const api_kuesioner_list = '/api/kuesioner';
const api_kuesioner_add = '/api/kuesioner/save';
const api_kuesioner_update = '/api/kuesioner/save';
const api_kuesioner_delete = '/api/kuesioner/delete';

export const setKuesioners = (updatedKuesioners) => ({
    type: SET_KUESIONERS,
    payload: updatedKuesioners,
});

export const fetchKuesioners = (filters, page = 1) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_KUESIONERS_REQUEST });
    try {
      const response = await axios.get(api_kuesioner_list, { params: { ...filters, page } });
      dispatch({ type: FETCH_KUESIONERS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_KUESIONERS_FAILURE, error });
    }
  };
};

export const addKuesioner = (event, peruntukan, target, id_bank_soal, fakultas, prodi, unit) => {
  return async (dispatch) => {
    dispatch({ type: ADD_KUESIONER_REQUEST });
    try {
      const response = await axios.post(api_kuesioner_add, { event, peruntukan, target, id_bank_soal, fakultas, prodi, unit });
      dispatch({ type: ADD_KUESIONER_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: ADD_KUESIONER_FAILURE, error, validation });
    }
  };
};

export const updateKuesioner = (event, id_kuesioner,data) => {
  return async (dispatch) => {
    dispatch({ type: UPDATE_KUESIONER_REQUEST });
    try {
      const response = await axios.post(api_kuesioner_update, { event, id_kuesioner, data });
      dispatch({ type: UPDATE_KUESIONER_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: UPDATE_KUESIONER_FAILURE, error, validation });
    }
  };
};

export const deleteKuesioner = (ids) => {
  return async (dispatch) => {
    dispatch({ type: DELETE_KUESIONER_REQUEST });
    try {
      const response = await axios.post(api_kuesioner_delete, { id: ids });
      dispatch({ type: DELETE_KUESIONER_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: DELETE_KUESIONER_FAILURE, error, validation });
    }
  };
};