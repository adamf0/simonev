  import {
    FETCH_PENGGUNAS_REQUEST,
    FETCH_PENGGUNAS_SUCCESS,
    FETCH_PENGGUNAS_FAILURE,
    ADD_PENGGUNA_REQUEST,
    ADD_PENGGUNA_SUCCESS,
    ADD_PENGGUNA_FAILURE,
    UPDATE_PENGGUNA_REQUEST,
    UPDATE_PENGGUNA_SUCCESS,
    UPDATE_PENGGUNA_FAILURE,
    DELETE_PENGGUNA_REQUEST,
    DELETE_PENGGUNA_SUCCESS,
    DELETE_PENGGUNA_FAILURE,
    SET_PENGGUNAS
  } from '../actions/penggunaActions';
  
  const initialState = {
    penggunas: {
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
  
  const penggunaReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_PENGGUNAS_REQUEST:
      case ADD_PENGGUNA_REQUEST:
      case UPDATE_PENGGUNA_REQUEST:
      case DELETE_PENGGUNA_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_PENGGUNAS_SUCCESS:
        return {
          ...state,
          penggunas: {
            record: action.payload.data,
            currentPage: action.payload.currentPage,
            total: action.payload.total,
          },
          loading: false, 
          action_type:action.type
        };
  
      case ADD_PENGGUNA_SUCCESS:
      case UPDATE_PENGGUNA_SUCCESS:
      case DELETE_PENGGUNA_SUCCESS:
        return { ...state, loading: false, action_type:action.type };
  
      case FETCH_PENGGUNAS_FAILURE:
      case ADD_PENGGUNA_FAILURE:
      case UPDATE_PENGGUNA_FAILURE:
      case DELETE_PENGGUNA_FAILURE:
        return { ...state, loading: false, error: action.error, validation: action?.validation, action_type:action.type };
  
      case SET_PENGGUNAS: // Handle the action for setting bank soals
        return {
          ...state,
          penggunas: {
            ...state.penggunas,
            record: action.payload, // Set updated bank soals
            action_type:action.type
          }
        };

      default:
        return state;
    }
  };
  
  export default penggunaReducer;
  