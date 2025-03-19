  import {
    FETCH_BANK_SOALS_REQUEST,
    FETCH_BANK_SOALS_SUCCESS,
    FETCH_BANK_SOALS_FAILURE,
    ADD_BANK_SOAL_REQUEST,
    ADD_BANK_SOAL_SUCCESS,
    ADD_BANK_SOAL_FAILURE,
    UPDATE_BANK_SOAL_REQUEST,
    UPDATE_BANK_SOAL_SUCCESS,
    UPDATE_BANK_SOAL_FAILURE,
    DELETE_BANK_SOAL_REQUEST,
    DELETE_BANK_SOAL_SUCCESS,
    DELETE_BANK_SOAL_FAILURE,
    CHANGE_STATUS_REQUEST,
    CHANGE_STATUS_SUCCESS,
    CHANGE_STATUS_FAILURE,
    SET_BANK_SOALS,
    COPY_BANK_SOAL_REQUEST,
    COPY_BANK_SOAL_SUCCESS,
    COPY_BANK_SOAL_FAILURE,
    BRANCH_BANK_SOAL_REQUEST,
    BRANCH_BANK_SOAL_SUCCESS,
    BRANCH_BANK_SOAL_FAILURE
  } from '../actions/bankSoalActions';
  
  const initialState = {
    bankSoals: {
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
    loading: false,
    error: null,
    validation: null,
    action_type: null
  };
  
  const bankSoalReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_BANK_SOALS_REQUEST:
      case ADD_BANK_SOAL_REQUEST:
      case UPDATE_BANK_SOAL_REQUEST:
      case COPY_BANK_SOAL_REQUEST:
      case BRANCH_BANK_SOAL_REQUEST:
      case DELETE_BANK_SOAL_REQUEST:
      case CHANGE_STATUS_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_BANK_SOALS_SUCCESS:
        return {
          ...state,
          bankSoals: {
            record: action.payload.data,
            currentPage: action.payload.currentPage,
            total: action.payload.total,
          },
          loading: false, 
          action_type:action.type
        };
  
      case ADD_BANK_SOAL_SUCCESS:
      case UPDATE_BANK_SOAL_SUCCESS:
      case COPY_BANK_SOAL_SUCCESS:
      case BRANCH_BANK_SOAL_SUCCESS:
      case DELETE_BANK_SOAL_SUCCESS:
      case CHANGE_STATUS_SUCCESS:
        return { ...state, loading: false, action_type:action.type };
  
      case FETCH_BANK_SOALS_FAILURE:
      case ADD_BANK_SOAL_FAILURE:
      case UPDATE_BANK_SOAL_FAILURE:
      case COPY_BANK_SOAL_FAILURE:
      case BRANCH_BANK_SOAL_FAILURE:
      case DELETE_BANK_SOAL_FAILURE:
      case CHANGE_STATUS_FAILURE:
        return { ...state, loading: false, error: action.error, validation: action?.validation, action_type:action.type };
  
      case SET_BANK_SOALS: // Handle the action for setting bank soals
        return {
          ...state,
          bankSoals: {
            ...state.bankSoals,
            record: action.payload, // Set updated bank soals
            action_type:action.type
          }
        };

      default:
        return state;
    }
  };
  
  export default bankSoalReducer;
  