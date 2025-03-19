  import {
    FETCH_CHART_FAKULTAS_REQUEST,
    FETCH_CHART_FAKULTAS_SUCCESS,
    FETCH_CHART_FAKULTAS_FAILURE
  } from '../actions/chartFakultasActions';
  
  const initialState = {
    chartFakultas: {
            labels: ["no data"],
            datasets: [
              {
                data: [0],
              }
            ]
        },
    filters: {},
    loading: false,
    error: null,
    action_type: null
  };
  
  const chartFakultasReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_CHART_FAKULTAS_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_CHART_FAKULTAS_SUCCESS:
        return {
          ...state,
          chartFakultas: action.payload,
          loading: false, 
          action_type:action.type
        };
    
      case FETCH_CHART_FAKULTAS_FAILURE:
        return { ...state, loading: false, error: action.error, action_type:action.type };
  
      default:
        return state;
    }
  };
  
  export default chartFakultasReducer;
  