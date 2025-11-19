import {
  FETCH_CHART_TOTAL_REQUEST,
  FETCH_CHART_TOTAL_START,
  FETCH_CHART_TOTAL_CHUNK,
  FETCH_CHART_TOTAL_SUCCESS,
  FETCH_CHART_TOTAL_FAILURE
} from "../actions/chartTotalActions";

const initialState = {
  chart: [],      // data hasil SSE chunk
  loading: false,
  error: null,
  action_type: null
};

const chartTotalReducer = (state = initialState, action) => {
  switch (action.type) {

    case FETCH_CHART_TOTAL_REQUEST:
      return {
        ...state,
        loading: true,
        chart: [],        // reset hasil lama
        error: null,
        action_type: action.type
      };

    case FETCH_CHART_TOTAL_START:
      return {
        ...state,
        action_type: action.type
      };

    case FETCH_CHART_TOTAL_CHUNK:
      return {
        ...state,
        chart: [...state.chart, ...action.payload],  // append chunk
        action_type: action.type
      };

    case FETCH_CHART_TOTAL_SUCCESS:
      return {
        ...state,
        loading: false,
        chart: [...state.chart],   // pastikan tidak dihapus
        action_type: action.type
      };

    case FETCH_CHART_TOTAL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error,
        action_type: action.type
      };

    default:
      return state;
  }
};

export default chartTotalReducer;