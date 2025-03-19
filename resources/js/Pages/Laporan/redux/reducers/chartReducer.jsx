  import {
    FETCH_CHART_REQUEST,
    FETCH_CHART_SUCCESS,
    FETCH_CHART_FAILURE
  } from '../actions/chartActions';
  
  const initialState = {
    chart: {},
    filters: {},
    loading: false,
    error: null,
    action_type: null
  };
  
  const chartReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_CHART_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_CHART_SUCCESS:
        return {
          ...state,
          chart: action.payload,
          loading: false, 
          action_type:action.type
        };
    
      case FETCH_CHART_FAILURE:
        return { ...state, loading: false, error: action.error, action_type:action.type };
  
      default:
        return state;
    }
  };
  
  export default chartReducer;
  