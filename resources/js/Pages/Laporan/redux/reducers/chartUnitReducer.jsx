  import {
    FETCH_CHART_UNIT_REQUEST,
    FETCH_CHART_UNIT_SUCCESS,
    FETCH_CHART_UNIT_FAILURE
  } from '../actions/chartUnitActions';
  
  const initialState = {
    chartUnit: {},
    filters: {},
    loading: false,
    error: null,
    action_type: null
  };
  
  const chartUnitReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_CHART_UNIT_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_CHART_UNIT_SUCCESS:
        return {
          ...state,
          chartUnit: action.payload,
          loading: false, 
          action_type:action.type
        };
    
      case FETCH_CHART_UNIT_FAILURE:
        return { ...state, loading: false, error: action.error, action_type:action.type };
  
      default:
        return state;
    }
  };
  
  export default chartUnitReducer;
  