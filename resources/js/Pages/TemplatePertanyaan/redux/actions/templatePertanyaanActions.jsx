import axios from 'axios';

export const FETCH_TEMPLATE_PERTANYAANS_REQUEST = 'FETCH_TEMPLATE_PERTANYAANS_REQUEST';
export const FETCH_TEMPLATE_PERTANYAANS_SUCCESS = 'FETCH_TEMPLATE_PERTANYAANS_SUCCESS';
export const FETCH_TEMPLATE_PERTANYAANS_FAILURE = 'FETCH_TEMPLATE_PERTANYAANS_FAILURE';

export const ADD_TEMPLATE_PERTANYAAN_REQUEST = 'ADD_TEMPLATE_PERTANYAAN_REQUEST';
export const ADD_TEMPLATE_PERTANYAAN_SUCCESS = 'ADD_TEMPLATE_PERTANYAAN_SUCCESS';
export const ADD_TEMPLATE_PERTANYAAN_FAILURE = 'ADD_TEMPLATE_PERTANYAAN_FAILURE';

export const UPDATE_TEMPLATE_PERTANYAAN_REQUEST = 'UPDATE_TEMPLATE_PERTANYAAN_REQUEST';
export const UPDATE_TEMPLATE_PERTANYAAN_SUCCESS = 'UPDATE_TEMPLATE_PERTANYAAN_SUCCESS';
export const UPDATE_TEMPLATE_PERTANYAAN_FAILURE = 'UPDATE_TEMPLATE_PERTANYAAN_FAILURE';

export const DELETE_TEMPLATE_PERTANYAAN_REQUEST = 'DELETE_TEMPLATE_PERTANYAAN_REQUEST';
export const DELETE_TEMPLATE_PERTANYAAN_SUCCESS = 'DELETE_TEMPLATE_PERTANYAAN_SUCCESS';
export const DELETE_TEMPLATE_PERTANYAAN_FAILURE = 'DELETE_TEMPLATE_PERTANYAAN_FAILURE';

export const SET_TEMPLATE_PERTANYAANS = 'SET_TEMPLATE_PERTANYAANS';

const api_templatePertanyaan_list = '/api/templatePertanyaan';
const api_templatePertanyaan_add = '/api/templatePertanyaan/save';
const api_templatePertanyaan_delete = '/api/templatePertanyaan/delete';

export const setTemplatePertanyaans = (updatedTemplatePertanyaans) => ({
    type: SET_TEMPLATE_PERTANYAANS,
    payload: updatedTemplatePertanyaans,
});

export const fetchTemplatePertanyaans = (filters, page = 1) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_TEMPLATE_PERTANYAANS_REQUEST });
    try {
      const response = await axios.get(api_templatePertanyaan_list, { params: { ...filters, page } });
      dispatch({ type: FETCH_TEMPLATE_PERTANYAANS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_TEMPLATE_PERTANYAANS_FAILURE, error });
    }
  };
};

export const addTemplatePertanyaan = (id_bank_soal, pertanyaan, jenis_pilihan, bobot, kategori, subKategori, required) => {
  return async (dispatch) => {
    dispatch({ type: ADD_TEMPLATE_PERTANYAAN_REQUEST });
    try {
      const response = await axios.post(api_templatePertanyaan_add, { id_bank_soal, pertanyaan, jenis_pilihan, bobot, kategori, subKategori, required });
      dispatch({ type: ADD_TEMPLATE_PERTANYAAN_SUCCESS, payload: response.data, current_id:response.data.current_id });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: ADD_TEMPLATE_PERTANYAAN_FAILURE, error, validation });
    }
  };
};

export const updateTemplatePertanyaan = (id=null, id_bank_soal, pertanyaan, jenis_pilihan, bobot, kategori, subKategori, required) => {
  return async (dispatch) => {
    dispatch({ type: UPDATE_TEMPLATE_PERTANYAAN_REQUEST });
    try {
      const response = await axios.post(api_templatePertanyaan_add, { id, id_bank_soal, pertanyaan, jenis_pilihan, bobot, kategori, subKategori, required});
      dispatch({ type: UPDATE_TEMPLATE_PERTANYAAN_SUCCESS, payload: response.data, current_id:response.data.current_id });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: UPDATE_TEMPLATE_PERTANYAAN_FAILURE, error, validation });
    }
  };
};

export const deleteTemplatePertanyaan = (ids) => {
  return async (dispatch) => {
    dispatch({ type: DELETE_TEMPLATE_PERTANYAAN_REQUEST });
    try {
      const response = await axios.post(api_templatePertanyaan_delete, { id: ids });
      dispatch({ type: DELETE_TEMPLATE_PERTANYAAN_SUCCESS, payload: response.data, current_id:response.data.current_id });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: DELETE_TEMPLATE_PERTANYAAN_FAILURE, error, validation });
    }
  };
};