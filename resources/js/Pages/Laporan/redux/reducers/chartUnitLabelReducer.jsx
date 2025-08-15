  import {
    FETCH_CHART_UNIT_LABEL_REQUEST,
    FETCH_CHART_UNIT_LABEL_SUCCESS,
    FETCH_CHART_UNIT_LABEL_FAILURE
  } from '../actions/fetchChartUnitLabel';
  
  const initialState = {
    chartUnitLabel: [],
    filters: {},
    loading: false,
    error: null,
    action_type: null
  };
  
  const chartUnitLabelReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_CHART_UNIT_LABEL_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_CHART_UNIT_LABEL_SUCCESS:
        return {
          ...state,
          chartUnitLabel: action.payload,
          loading: false, 
          action_type:action.type
        };
    
      case FETCH_CHART_UNIT_LABEL_FAILURE:
        return { ...state, loading: false, error: action.error, action_type:action.type };
  
      default:
        return state;
    }
  };
  
  export default chartUnitLabelReducer;
  