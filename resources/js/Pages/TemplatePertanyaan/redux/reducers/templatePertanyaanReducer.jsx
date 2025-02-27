  import {
    FETCH_TEMPLATE_PERTANYAANS_REQUEST,
    FETCH_TEMPLATE_PERTANYAANS_SUCCESS,
    FETCH_TEMPLATE_PERTANYAANS_FAILURE,
    ADD_TEMPLATE_PERTANYAAN_REQUEST,
    ADD_TEMPLATE_PERTANYAAN_SUCCESS,
    ADD_TEMPLATE_PERTANYAAN_FAILURE,
    UPDATE_TEMPLATE_PERTANYAAN_REQUEST,
    UPDATE_TEMPLATE_PERTANYAAN_SUCCESS,
    UPDATE_TEMPLATE_PERTANYAAN_FAILURE,
    DELETE_TEMPLATE_PERTANYAAN_REQUEST,
    DELETE_TEMPLATE_PERTANYAAN_SUCCESS,
    DELETE_TEMPLATE_PERTANYAAN_FAILURE,
  } from '../actions/templatePertanyaanActions';
  
  const initialState = {
    templatePertanyaans: {
      record: [],
      currentPage: 1,
      total: 0,
    },
    filters: {
      judul: '',
      status: '',
      deskripsi: '',
      start_date: '',
      end_date: ''
    },
    current_id: null,
    loading: false,
    error: null,
    validation: null,
    action_type: null
  };
  
  const templatePertanyaanReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_TEMPLATE_PERTANYAANS_REQUEST:
      case ADD_TEMPLATE_PERTANYAAN_REQUEST:
      case UPDATE_TEMPLATE_PERTANYAAN_REQUEST:
      case DELETE_TEMPLATE_PERTANYAAN_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_TEMPLATE_PERTANYAANS_SUCCESS:
        return {
          ...state,
          templatePertanyaans: {
            record: action.payload.data,
            currentPage: action.payload.currentPage,
            total: action.payload.total,
          },
          loading: false, 
          action_type:action.type
        };

      case ADD_TEMPLATE_PERTANYAAN_SUCCESS:
      case UPDATE_TEMPLATE_PERTANYAAN_SUCCESS:
      case DELETE_TEMPLATE_PERTANYAAN_SUCCESS:
        return { ...state, loading: false, action_type:action.type, current_id:action?.current_id };
  
      case FETCH_TEMPLATE_PERTANYAANS_FAILURE:
      case ADD_TEMPLATE_PERTANYAAN_FAILURE:
      case UPDATE_TEMPLATE_PERTANYAAN_FAILURE:
      case DELETE_TEMPLATE_PERTANYAAN_FAILURE:
        return { ...state, loading: false, error: action.error, validation: action?.validation, action_type:action.type };
  
      default:
        return state;
    }
  };
  
  export default templatePertanyaanReducer;
  