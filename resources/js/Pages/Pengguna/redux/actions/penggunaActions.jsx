import axios from 'axios';

export const FETCH_PENGGUNAS_REQUEST = 'FETCH_PENGGUNAS_REQUEST';
export const FETCH_PENGGUNAS_SUCCESS = 'FETCH_PENGGUNAS_SUCCESS';
export const FETCH_PENGGUNAS_FAILURE = 'FETCH_PENGGUNAS_FAILURE';

export const ADD_PENGGUNA_REQUEST = 'ADD_PENGGUNA_REQUEST';
export const ADD_PENGGUNA_SUCCESS = 'ADD_PENGGUNA_SUCCESS';
export const ADD_PENGGUNA_FAILURE = 'ADD_PENGGUNA_FAILURE';

export const UPDATE_PENGGUNA_REQUEST = 'UPDATE_PENGGUNA_REQUEST';
export const UPDATE_PENGGUNA_SUCCESS = 'UPDATE_PENGGUNA_SUCCESS';
export const UPDATE_PENGGUNA_FAILURE = 'UPDATE_PENGGUNA_FAILURE';

export const DELETE_PENGGUNA_REQUEST = 'DELETE_PENGGUNA_REQUEST';
export const DELETE_PENGGUNA_SUCCESS = 'DELETE_PENGGUNA_SUCCESS';
export const DELETE_PENGGUNA_FAILURE = 'DELETE_PENGGUNA_FAILURE';

export const SET_PENGGUNAS = 'SET_PENGGUNAS';

const api_pengguna_list = '/api/pengguna';
const api_pengguna_add = '/api/pengguna/save';
const api_pengguna_update = '/api/pengguna/update';
const api_pengguna_delete = '/api/pengguna/delete';

export const setPenggunas = (updatedPenggunas) => ({
    type: SET_PENGGUNAS,
    payload: updatedPenggunas,
});

export const fetchPenggunas = (filters, page = 1) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_PENGGUNAS_REQUEST });
    try {
      const response = await axios.get(api_pengguna_list, { params: { ...filters, page } });
      dispatch({ type: FETCH_PENGGUNAS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_PENGGUNAS_FAILURE, error });
    }
  };
};

export const addPengguna = (username,nama,password,level,fakultas) => {
  return async (dispatch) => {
    dispatch({ type: ADD_PENGGUNA_REQUEST });
    try {
      const response = await axios.post(api_pengguna_add, { username,nama,password,level,fakultas });
      dispatch({ type: ADD_PENGGUNA_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: ADD_PENGGUNA_FAILURE, error, validation });
    }
  };
};

export const updatePengguna = (id,username,nama,password,level,fakultas) => {
  return async (dispatch) => {
    dispatch({ type: UPDATE_PENGGUNA_REQUEST });
    try {
      const response = await axios.post(api_pengguna_update, { id,username,nama,password,level,fakultas });
      dispatch({ type: UPDATE_PENGGUNA_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: UPDATE_PENGGUNA_FAILURE, error, validation });
    }
  };
};

export const deletePengguna = (ids) => {
  return async (dispatch) => {
    dispatch({ type: DELETE_PENGGUNA_REQUEST });
    try {
      const response = await axios.post(api_pengguna_delete, { id: ids });
      dispatch({ type: DELETE_PENGGUNA_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: DELETE_PENGGUNA_FAILURE, error, validation });
    }
  };
};