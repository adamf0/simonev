  import {
    FETCH_LAPORANS_REQUEST,
    FETCH_LAPORANS_SUCCESS,
    FETCH_LAPORANS_FAILURE,
  } from '../actions/laporanActions';
  
  const initialState = {
    laporans: {
      record: [],
      currentPage: 1,
      total: 0,
    },
    filters: {},
    loading: false,
    error: null,
    validation: null,
    action_type: null
  };
  
  const laporanReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_LAPORANS_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_LAPORANS_SUCCESS:
        return {
          ...state,
          laporans: {
            record: action.payload,
            currentPage: action.payload.currentPage,
            total: action.payload.total,
          },
          loading: false, 
          action_type:action.type
        };
    
      case FETCH_LAPORANS_FAILURE:
        return { ...state, loading: false, error: action.error, validation: action?.validation, action_type:action.type };
  
      default:
        return state;
    }
  };
  
  export default laporanReducer;
  