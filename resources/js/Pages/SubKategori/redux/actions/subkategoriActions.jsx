import axios from 'axios';

export const FETCH_SUBKATEGORIS_REQUEST = 'FETCH_SUBKATEGORIS_REQUEST';
export const FETCH_SUBKATEGORIS_SUCCESS = 'FETCH_SUBKATEGORIS_SUCCESS';
export const FETCH_SUBKATEGORIS_FAILURE = 'FETCH_SUBKATEGORIS_FAILURE';

export const ADD_SUBKATEGORI_REQUEST = 'ADD_SUBKATEGORI_REQUEST';
export const ADD_SUBKATEGORI_SUCCESS = 'ADD_SUBKATEGORI_SUCCESS';
export const ADD_SUBKATEGORI_FAILURE = 'ADD_SUBKATEGORI_FAILURE';

export const UPDATE_SUBKATEGORI_REQUEST = 'UPDATE_SUBKATEGORI_REQUEST';
export const UPDATE_SUBKATEGORI_SUCCESS = 'UPDATE_SUBKATEGORI_SUCCESS';
export const UPDATE_SUBKATEGORI_FAILURE = 'UPDATE_SUBKATEGORI_FAILURE';

export const DELETE_SUBKATEGORI_REQUEST = 'DELETE_SUBKATEGORI_REQUEST';
export const DELETE_SUBKATEGORI_SUCCESS = 'DELETE_SUBKATEGORI_SUCCESS';
export const DELETE_SUBKATEGORI_FAILURE = 'DELETE_SUBKATEGORI_FAILURE';

export const SET_SUBKATEGORIS = 'SET_SUBKATEGORIS';

const api_subkategori_list = '/api/subkategori';
const api_subkategori_add = '/api/subkategori/save';
const api_subkategori_update = '/api/subkategori/update';
const api_subkategori_delete = '/api/subkategori/delete';

export const setSubKategoris = (updatedSubKategoris) => ({
    type: SET_SUBKATEGORIS,
    payload: updatedSubKategoris,
});

export const fetchSubKategoris = (filters, page = 1) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_SUBKATEGORIS_REQUEST });
    try {
      const response = await axios.get(api_subkategori_list, { params: { ...filters, page } });
      dispatch({ type: FETCH_SUBKATEGORIS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_SUBKATEGORIS_FAILURE, error });
    }
  };
};

export const addSubKategori = (id_kategori, nama_sub, fakultas) => {
  return async (dispatch) => {
    dispatch({ type: ADD_SUBKATEGORI_REQUEST });
    try {
      const response = await axios.post(api_subkategori_add, { id_kategori, nama_sub, fakultas});
      dispatch({ type: ADD_SUBKATEGORI_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: ADD_SUBKATEGORI_FAILURE, error, validation });
    }
  };
};

export const updateSubKategori = (id, id_kategori, nama_sub, fakultas) => {
  return async (dispatch) => {
    dispatch({ type: UPDATE_SUBKATEGORI_REQUEST });
    try {
      const response = await axios.post(api_subkategori_update, { id, id_kategori, nama_sub, fakultas });
      dispatch({ type: UPDATE_SUBKATEGORI_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: UPDATE_SUBKATEGORI_FAILURE, error, validation });
    }
  };
};

export const deleteSubKategori = (ids) => {
  return async (dispatch) => {
    dispatch({ type: DELETE_SUBKATEGORI_REQUEST });
    try {
      const response = await axios.post(api_subkategori_delete, { id: ids });
      dispatch({ type: DELETE_SUBKATEGORI_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: DELETE_SUBKATEGORI_FAILURE, error, validation });
    }
  };
};