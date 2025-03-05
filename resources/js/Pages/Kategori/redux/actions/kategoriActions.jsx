import axios from 'axios';

export const FETCH_KATEGORIS_REQUEST = 'FETCH_KATEGORIS_REQUEST';
export const FETCH_KATEGORIS_SUCCESS = 'FETCH_KATEGORIS_SUCCESS';
export const FETCH_KATEGORIS_FAILURE = 'FETCH_KATEGORIS_FAILURE';

export const ADD_KATEGORI_REQUEST = 'ADD_KATEGORI_REQUEST';
export const ADD_KATEGORI_SUCCESS = 'ADD_KATEGORI_SUCCESS';
export const ADD_KATEGORI_FAILURE = 'ADD_KATEGORI_FAILURE';

export const UPDATE_KATEGORI_REQUEST = 'UPDATE_KATEGORI_REQUEST';
export const UPDATE_KATEGORI_SUCCESS = 'UPDATE_KATEGORI_SUCCESS';
export const UPDATE_KATEGORI_FAILURE = 'UPDATE_KATEGORI_FAILURE';

export const DELETE_KATEGORI_REQUEST = 'DELETE_KATEGORI_REQUEST';
export const DELETE_KATEGORI_SUCCESS = 'DELETE_KATEGORI_SUCCESS';
export const DELETE_KATEGORI_FAILURE = 'DELETE_KATEGORI_FAILURE';

export const SET_KATEGORIS = 'SET_KATEGORIS';

const api_kategori_list = '/api/kategori';
const api_kategori_add = '/api/kategori/save';
const api_kategori_update = '/api/kategori/update';
const api_kategori_delete = '/api/kategori/delete';

export const setKategoris = (updatedKategoris) => ({
    type: SET_KATEGORIS,
    payload: updatedKategoris,
});

export const fetchKategoris = (filters, page = 1) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_KATEGORIS_REQUEST });
    try {
      const response = await axios.get(api_kategori_list, { params: { ...filters, page } });
      dispatch({ type: FETCH_KATEGORIS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_KATEGORIS_FAILURE, error });
    }
  };
};

export const addKategori = (nama_kategori) => {
  return async (dispatch) => {
    dispatch({ type: ADD_KATEGORI_REQUEST });
    try {
      const response = await axios.post(api_kategori_add, { nama_kategori });
      dispatch({ type: ADD_KATEGORI_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: ADD_KATEGORI_FAILURE, error, validation });
    }
  };
};

export const updateKategori = (id,nama_kategori) => {
  return async (dispatch) => {
    dispatch({ type: UPDATE_KATEGORI_REQUEST });
    try {
      const response = await axios.post(api_kategori_update, { id,nama_kategori });
      dispatch({ type: UPDATE_KATEGORI_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: UPDATE_KATEGORI_FAILURE, error, validation });
    }
  };
};

export const deleteKategori = (ids) => {
  return async (dispatch) => {
    dispatch({ type: DELETE_KATEGORI_REQUEST });
    try {
      const response = await axios.post(api_kategori_delete, { id: ids });
      dispatch({ type: DELETE_KATEGORI_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: DELETE_KATEGORI_FAILURE, error, validation });
    }
  };
};