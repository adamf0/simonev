  import {
    FETCH_CHART_TOTAL_REQUEST,
    FETCH_CHART_TOTAL_SUCCESS,
    FETCH_CHART_TOTAL_FAILURE
  } from '../actions/chartTotalActions';
  
  const initialState = {
    data: {},
    filters: {},
    loading: false,
    error: null,
    action_type: null
  };
  
  const chartTotalReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_CHART_TOTAL_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_CHART_TOTAL_SUCCESS:
        return {
          ...state,
          data: action.payload,
          loading: false, 
          action_type:action.type
        };
    
      case FETCH_CHART_TOTAL_FAILURE:
        return { ...state, loading: false, error: action.error, action_type:action.type };
  
      default:
        return state;
    }
  };
  
  export default chartTotalReducer;
  