  import {
    FETCH_CHART_PRODI_LABEL_REQUEST,
    FETCH_CHART_PRODI_LABEL_SUCCESS,
    FETCH_CHART_PRODI_LABEL_FAILURE
  } from '../actions/fetchChartProdiLabel';
  
  const initialState = {
    chartProdiLabel: [],
    filters: {},
    loading: false,
    error: null,
    action_type: null
  };
  
  const chartProdiLabelReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_CHART_PRODI_LABEL_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_CHART_PRODI_LABEL_SUCCESS:
        console.log(action.payload)
        return {
          ...state,
          chartProdiLabel: action.payload,
          loading: false, 
          action_type:action.type
        };
    
      case FETCH_CHART_PRODI_LABEL_FAILURE:
        return { ...state, loading: false, error: action.error, action_type:action.type };
  
      default:
        return state;
    }
  };
  
  export default chartProdiLabelReducer;
  