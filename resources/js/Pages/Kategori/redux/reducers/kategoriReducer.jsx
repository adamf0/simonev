  import {
    FETCH_KATEGORIS_REQUEST,
    FETCH_KATEGORIS_SUCCESS,
    FETCH_KATEGORIS_FAILURE,
    ADD_KATEGORI_REQUEST,
    ADD_KATEGORI_SUCCESS,
    ADD_KATEGORI_FAILURE,
    UPDATE_KATEGORI_REQUEST,
    UPDATE_KATEGORI_SUCCESS,
    UPDATE_KATEGORI_FAILURE,
    DELETE_KATEGORI_REQUEST,
    DELETE_KATEGORI_SUCCESS,
    DELETE_KATEGORI_FAILURE,
    SET_KATEGORIS
  } from '../actions/kategoriActions';
  
  const initialState = {
    kategoris: {
      record: [],
      currentPage: 1,
      total: 0,
    },
    filters: {
      nama: '',
      level: '',
    },
    loading: false,
    error: null,
    validation: null,
    action_type: null
  };
  
  const kategoriReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_KATEGORIS_REQUEST:
      case ADD_KATEGORI_REQUEST:
      case UPDATE_KATEGORI_REQUEST:
      case DELETE_KATEGORI_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_KATEGORIS_SUCCESS:
        return {
          ...state,
          kategoris: {
            record: action.payload.data,
            currentPage: action.payload.currentPage,
            total: action.payload.total,
          },
          loading: false, 
          action_type:action.type
        };
  
      case ADD_KATEGORI_SUCCESS:
      case UPDATE_KATEGORI_SUCCESS:
      case DELETE_KATEGORI_SUCCESS:
        return { ...state, loading: false, action_type:action.type };
  
      case FETCH_KATEGORIS_FAILURE:
      case ADD_KATEGORI_FAILURE:
      case UPDATE_KATEGORI_FAILURE:
      case DELETE_KATEGORI_FAILURE:
        return { ...state, loading: false, error: action.error, validation: action?.validation, action_type:action.type };
  
      case SET_KATEGORIS: // Handle the action for setting bank soals
        return {
          ...state,
          kategoris: {
            ...state.kategoris,
            record: action.payload, // Set updated bank soals
            action_type:action.type
          }
        };

      default:
        return state;
    }
  };
  
  export default kategoriReducer;
  