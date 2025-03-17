  import {
    FETCH_CHART_PRODI_REQUEST,
    FETCH_CHART_PRODI_SUCCESS,
    FETCH_CHART_PRODI_FAILURE
  } from '../actions/chartProdiActions';
  
  const initialState = {
    chartProdi: {},
    filters: {},
    loading: false,
    error: null,
    action_type: null
  };
  
  const chartProdiReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_CHART_PRODI_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_CHART_PRODI_SUCCESS:
        return {
          ...state,
          chartProdi: action.payload,
          loading: false, 
          action_type:action.type
        };
    
      case FETCH_CHART_PRODI_FAILURE:
        return { ...state, loading: false, error: action.error, action_type:action.type };
  
      default:
        return state;
    }
  };
  
  export default chartProdiReducer;
  