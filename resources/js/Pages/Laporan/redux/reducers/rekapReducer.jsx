  import {
    FETCH_REKAPS_REQUEST,
    FETCH_REKAPS_SUCCESS,
    FETCH_REKAPS_FAILURE,
  } from '../actions/rekapActions';
  
  const initialState = {
    rekaps: {
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
  
  const rekapReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_REKAPS_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_REKAPS_SUCCESS:
        console.log(action);
        return {
          ...state,
          rekaps: {
            record: action.payload,
            currentPage: action.payload.currentPage,
            total: action.payload.total,
          },
          loading: false, 
          action_type:action.type
        };
    
      case FETCH_REKAPS_FAILURE:
        return { ...state, loading: false, error: action.error, validation: action?.validation, action_type:action.type };
  
      default:
        return state;
    }
  };
  
  export default rekapReducer;
  