import axios from 'axios';

export const FETCH_BANK_SOALS_REQUEST = 'FETCH_BANK_SOALS_REQUEST';
export const FETCH_BANK_SOALS_SUCCESS = 'FETCH_BANK_SOALS_SUCCESS';
export const FETCH_BANK_SOALS_FAILURE = 'FETCH_BANK_SOALS_FAILURE';

export const ADD_BANK_SOAL_REQUEST = 'ADD_BANK_SOAL_REQUEST';
export const ADD_BANK_SOAL_SUCCESS = 'ADD_BANK_SOAL_SUCCESS';
export const ADD_BANK_SOAL_FAILURE = 'ADD_BANK_SOAL_FAILURE';

export const UPDATE_BANK_SOAL_REQUEST = 'UPDATE_BANK_SOAL_REQUEST';
export const UPDATE_BANK_SOAL_SUCCESS = 'UPDATE_BANK_SOAL_SUCCESS';
export const UPDATE_BANK_SOAL_FAILURE = 'UPDATE_BANK_SOAL_FAILURE';

export const DELETE_BANK_SOAL_REQUEST = 'DELETE_BANK_SOAL_REQUEST';
export const DELETE_BANK_SOAL_SUCCESS = 'DELETE_BANK_SOAL_SUCCESS';
export const DELETE_BANK_SOAL_FAILURE = 'DELETE_BANK_SOAL_FAILURE';

export const CHANGE_STATUS_REQUEST = 'CHANGE_STATUS_REQUEST';
export const CHANGE_STATUS_SUCCESS = 'CHANGE_STATUS_SUCCESS';
export const CHANGE_STATUS_FAILURE = 'CHANGE_STATUS_FAILURE';

export const COPY_BANK_SOAL_REQUEST = 'COPY_BANK_SOAL_REQUEST';
export const COPY_BANK_SOAL_SUCCESS = 'COPY_BANK_SOAL_SUCCESS';
export const COPY_BANK_SOAL_FAILURE = 'COPY_BANK_SOAL_FAILURE';

export const BRANCH_BANK_SOAL_REQUEST = 'BRANCH_BANK_SOAL_REQUEST';
export const BRANCH_BANK_SOAL_SUCCESS = 'BRANCH_BANK_SOAL_SUCCESS';
export const BRANCH_BANK_SOAL_FAILURE = 'BRANCH_BANK_SOAL_FAILURE';

export const SET_BANK_SOALS = 'SET_BANK_SOALS';

const api_bankSoal_list = '/api/bankSoal';
const api_bankSoal_add = '/api/bankSoal/save';
const api_bankSoal_update = '/api/bankSoal/update';
const api_bankSoal_copy = '/api/bankSoal/copy';
const api_bankSoal_branch = '/api/bankSoal/branch';
const api_bankSoal_delete = '/api/bankSoal/delete';
const api_bankSoal_status = '/api/bankSoal/status';

export const setBankSoals = (updatedBankSoals) => ({
    type: SET_BANK_SOALS,
    payload: updatedBankSoals,
});

export const fetchBankSoals = (filters, page = 1) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_BANK_SOALS_REQUEST });
    try {
      const response = await axios.get(api_bankSoal_list, { params: { ...filters, page } });
      dispatch({ type: FETCH_BANK_SOALS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_BANK_SOALS_FAILURE, error });
    }
  };
};

export const addBankSoal = (judul) => {
  return async (dispatch) => {
    dispatch({ type: ADD_BANK_SOAL_REQUEST });
    try {
      const response = await axios.post(api_bankSoal_add, { judul });
      dispatch({ type: ADD_BANK_SOAL_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: ADD_BANK_SOAL_FAILURE, error, validation });
    }
  };
};

export const updateBankSoal = (id,judul,deskripsi,peruntukan,rule, content) => {
  return async (dispatch) => {
    dispatch({ type: UPDATE_BANK_SOAL_REQUEST });
    try {
      const response = await axios.post(api_bankSoal_update, { id, judul, deskripsi, peruntukan, rule, content });
      dispatch({ type: UPDATE_BANK_SOAL_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: UPDATE_BANK_SOAL_FAILURE, error, validation });
    }
  };
};

export const copyBankSoal = (id,judul) => {
  return async (dispatch) => {
    dispatch({ type: COPY_BANK_SOAL_REQUEST });
    try {
      const response = await axios.post(api_bankSoal_copy, { id, judul });
      dispatch({ type: COPY_BANK_SOAL_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: COPY_BANK_SOAL_FAILURE, error, validation });
    }
  };
};

export const branchBankSoal = (id,target,level) => {
  return async (dispatch) => {
    dispatch({ type: BRANCH_BANK_SOAL_REQUEST });
    try {
      const response = await axios.post(api_bankSoal_branch, { id, target, level });
      dispatch({ type: BRANCH_BANK_SOAL_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: BRANCH_BANK_SOAL_FAILURE, error, validation });
    }
  };
};

export const deleteBankSoal = (ids) => {
  return async (dispatch) => {
    dispatch({ type: DELETE_BANK_SOAL_REQUEST });
    try {
      const response = await axios.post(api_bankSoal_delete, { id: ids });
      dispatch({ type: DELETE_BANK_SOAL_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: DELETE_BANK_SOAL_FAILURE, error, validation });
    }
  };
};

export const changeStatus = (id, status) => {
  return async (dispatch) => {
    dispatch({ type: CHANGE_STATUS_REQUEST });
    try {
      const response = await axios.get(`${api_bankSoal_status}/${id}/${status}`);
      dispatch({ type: CHANGE_STATUS_SUCCESS, payload: response.data });
      dispatch(fetchBankSoals());
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: CHANGE_STATUS_FAILURE, error, validation });
    }
  };
};
