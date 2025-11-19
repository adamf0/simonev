import {
  FETCH_CHART_REQUEST,
  FETCH_CHART_START,
  FETCH_CHART_CHUNK,
  FETCH_CHART_SUCCESS,
  FETCH_CHART_FAILURE
} from '../actions/chartActions';

const initialState = {
  chart: {},
  total_pertanyaan: 0,
  loaded_pertanyaan: 0,
  loading: false,
  error: null,
  action_type: null,
};

const chartReducer = (state = initialState, action) => {
  switch (action.type) {

    case FETCH_CHART_REQUEST:
      return { 
        ...state, 
        loading: true, 
        chart: {}, 
        action_type: action.type,
        loaded_pertanyaan: 0,
      };

    case FETCH_CHART_START:
      return {
        ...state,
        total_pertanyaan: action.payload.total_pertanyaan,
        action_type: action.type
      };

    case FETCH_CHART_CHUNK: {
      const chunk = action.payload;

      // key = "kategori#subKategori"
      const key = chunk.subKategori
        ? `${chunk.kategori}#${chunk.subKategori}`
        : chunk.kategori;

      // copy state chart sekarang
      const currentList = state.chart[key] || [];

      return {
        ...state,
        loaded_pertanyaan: state.loaded_pertanyaan + 1,
        chart: {
          ...state.chart,
          [key]: [...currentList, chunk]
        },
        action_type: action.type
      };
    }

    case FETCH_CHART_SUCCESS:
      return {
        ...state,
        loading: false,
        action_type: action.type
      };

    case FETCH_CHART_FAILURE:
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

export default chartReducer;
