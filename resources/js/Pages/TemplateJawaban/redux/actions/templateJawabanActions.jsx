import axios from 'axios';

export const FETCH_TEMPLATE_JAWABANS_REQUEST = 'FETCH_TEMPLATE_JAWABANS_REQUEST';
export const FETCH_TEMPLATE_JAWABANS_SUCCESS = 'FETCH_TEMPLATE_JAWABANS_SUCCESS';
export const FETCH_TEMPLATE_JAWABANS_FAILURE = 'FETCH_TEMPLATE_JAWABANS_FAILURE';

export const ADD_TEMPLATE_JAWABAN_REQUEST = 'ADD_TEMPLATE_JAWABAN_REQUEST';
export const ADD_TEMPLATE_JAWABAN_SUCCESS = 'ADD_TEMPLATE_JAWABAN_SUCCESS';
export const ADD_TEMPLATE_JAWABAN_FAILURE = 'ADD_TEMPLATE_JAWABAN_FAILURE';

export const UPDATE_TEMPLATE_JAWABAN_REQUEST = 'UPDATE_TEMPLATE_JAWABAN_REQUEST';
export const UPDATE_TEMPLATE_JAWABAN_SUCCESS = 'UPDATE_TEMPLATE_JAWABAN_SUCCESS';
export const UPDATE_TEMPLATE_JAWABAN_FAILURE = 'UPDATE_TEMPLATE_JAWABAN_FAILURE';

export const DELETE_TEMPLATE_JAWABAN_REQUEST = 'DELETE_TEMPLATE_JAWABAN_REQUEST';
export const DELETE_TEMPLATE_JAWABAN_SUCCESS = 'DELETE_TEMPLATE_JAWABAN_SUCCESS';
export const DELETE_TEMPLATE_JAWABAN_FAILURE = 'DELETE_TEMPLATE_JAWABAN_FAILURE';

export const SET_TEMPLATE_JAWABANS = 'SET_TEMPLATE_JAWABANS';

const api_templateJawaban_list = '/api/templateJawaban';
const api_templateJawaban_add = '/api/templateJawaban/save';
const api_templateJawaban_delete = '/api/templateJawaban/delete';

export const setTemplateJawabans = (updatedTemplateJawabans) => ({
    type: SET_TEMPLATE_JAWABANS,
    payload: updatedTemplateJawabans,
});

export const fetchTemplateJawabans = (id_template_soal) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_TEMPLATE_JAWABANS_REQUEST });
    try {
      const response = await axios.get(`${api_templateJawaban_list}/${id_template_soal}`);
      dispatch({ type: FETCH_TEMPLATE_JAWABANS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_TEMPLATE_JAWABANS_FAILURE, error });
    }
  };
};

export const addTemplateJawaban = (id_template_soal, freetext) => {
  return async (dispatch) => {
    dispatch({ type: ADD_TEMPLATE_JAWABAN_REQUEST });
    try {
      const response = await axios.post(api_templateJawaban_add, { id_template_soal, freetext });
      dispatch({ type: ADD_TEMPLATE_JAWABAN_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: ADD_TEMPLATE_JAWABAN_FAILURE, error, validation });
    }
  };
};

export const updateTemplateJawaban = (id=null, id_template_soal, jawaban, nilai) => {
  return async (dispatch) => {
    dispatch({ type: UPDATE_TEMPLATE_JAWABAN_REQUEST });
    try {
      const response = await axios.post(api_templateJawaban_add, { id, id_template_soal, jawaban, nilai });
      dispatch({ type: UPDATE_TEMPLATE_JAWABAN_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: UPDATE_TEMPLATE_JAWABAN_FAILURE, error, validation });
    }
  };
};

export const deleteTemplateJawaban = (ids) => {
  return async (dispatch) => {
    dispatch({ type: DELETE_TEMPLATE_JAWABAN_REQUEST });
    try {
      const response = await axios.post(api_templateJawaban_delete, { id: ids });
      dispatch({ type: DELETE_TEMPLATE_JAWABAN_SUCCESS, payload: response.data });
    } catch (error) {
      const validation = error?.response?.data?.validation;
      dispatch({ type: DELETE_TEMPLATE_JAWABAN_FAILURE, error, validation });
    }
  };
};