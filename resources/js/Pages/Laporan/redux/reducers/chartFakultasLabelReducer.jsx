  import {
    FETCH_CHART_FAKULTAS_LABEL_REQUEST,
    FETCH_CHART_FAKULTAS_LABEL_SUCCESS,
    FETCH_CHART_FAKULTAS_LABEL_FAILURE
  } from '../actions/fetchChartFakultasLabel';
  
  const initialState = {
    chartFakultasLabel: [],
    filters: {},
    loading: false,
    error: null,
    action_type: null
  };
  
  const chartFakultasLabelReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_CHART_FAKULTAS_LABEL_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_CHART_FAKULTAS_LABEL_SUCCESS:
        return {
          ...state,
          chartFakultasLabel: action.payload,
          loading: false, 
          action_type:action.type
        };
    
      case FETCH_CHART_FAKULTAS_LABEL_FAILURE:
        return { ...state, loading: false, error: action.error, action_type:action.type };
  
      default:
        return state;
    }
  };
  
  export default chartFakultasLabelReducer;
  