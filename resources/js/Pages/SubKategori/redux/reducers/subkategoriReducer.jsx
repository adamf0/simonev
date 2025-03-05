  import {
    FETCH_SUBKATEGORIS_REQUEST,
    FETCH_SUBKATEGORIS_SUCCESS,
    FETCH_SUBKATEGORIS_FAILURE,
    ADD_SUBKATEGORI_REQUEST,
    ADD_SUBKATEGORI_SUCCESS,
    ADD_SUBKATEGORI_FAILURE,
    UPDATE_SUBKATEGORI_REQUEST,
    UPDATE_SUBKATEGORI_SUCCESS,
    UPDATE_SUBKATEGORI_FAILURE,
    DELETE_SUBKATEGORI_REQUEST,
    DELETE_SUBKATEGORI_SUCCESS,
    DELETE_SUBKATEGORI_FAILURE,
    SET_SUBKATEGORIS
  } from '../actions/subkategoriActions';
  
  const initialState = {
    subkategoris: {
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
  
  const subkategoriReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_SUBKATEGORIS_REQUEST:
      case ADD_SUBKATEGORI_REQUEST:
      case UPDATE_SUBKATEGORI_REQUEST:
      case DELETE_SUBKATEGORI_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_SUBKATEGORIS_SUCCESS:
        return {
          ...state,
          subkategoris: {
            record: action.payload.data,
            currentPage: action.payload.currentPage,
            total: action.payload.total,
          },
          loading: false, 
          action_type:action.type
        };
  
      case ADD_SUBKATEGORI_SUCCESS:
      case UPDATE_SUBKATEGORI_SUCCESS:
      case DELETE_SUBKATEGORI_SUCCESS:
        return { ...state, loading: false, action_type:action.type };
  
      case FETCH_SUBKATEGORIS_FAILURE:
      case ADD_SUBKATEGORI_FAILURE:
      case UPDATE_SUBKATEGORI_FAILURE:
      case DELETE_SUBKATEGORI_FAILURE:
        return { ...state, loading: false, error: action.error, validation: action?.validation, action_type:action.type };
  
      case SET_SUBKATEGORIS: // Handle the action for setting bank soals
        return {
          ...state,
          subkategoris: {
            ...state.subkategoris,
            record: action.payload, // Set updated bank soals
            action_type:action.type
          }
        };

      default:
        return state;
    }
  };
  
  export default subkategoriReducer;
  