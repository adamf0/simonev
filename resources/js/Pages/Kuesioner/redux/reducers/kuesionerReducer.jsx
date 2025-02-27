  import {
    FETCH_KUESIONERS_REQUEST,
    FETCH_KUESIONERS_SUCCESS,
    FETCH_KUESIONERS_FAILURE,
    ADD_KUESIONER_REQUEST,
    ADD_KUESIONER_SUCCESS,
    ADD_KUESIONER_FAILURE,
    UPDATE_KUESIONER_REQUEST,
    UPDATE_KUESIONER_SUCCESS,
    UPDATE_KUESIONER_FAILURE,
    DELETE_KUESIONER_REQUEST,
    DELETE_KUESIONER_SUCCESS,
    DELETE_KUESIONER_FAILURE,
    SET_KUESIONERS
  } from '../actions/kuesionerActions';
  
  const initialState = {
    kuesioners: {
      record: [],
      currentPage: 1,
      total: 0,
    },
    filters: {},
    id_kuesioner:null,
    loading: false,
    error: null,
    validation: null,
    action_type: null
  };
  
  const kuesionerReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_KUESIONERS_REQUEST:
      case ADD_KUESIONER_REQUEST:
      case UPDATE_KUESIONER_REQUEST:
      case DELETE_KUESIONER_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_KUESIONERS_SUCCESS:
        return {
          ...state,
          kuesioners: {
            record: action.payload.data,
            currentPage: action.payload.currentPage,
            total: action.payload.total,
          },
          loading: false, 
          action_type:action.type
        };
  
      case ADD_KUESIONER_SUCCESS:
        return { ...state, loading: false, action_type:action.type, id_kuesioner:action.payload.data};

      case UPDATE_KUESIONER_SUCCESS:
      case DELETE_KUESIONER_SUCCESS:
        return { ...state, loading: false, action_type:action.type };
  
      case FETCH_KUESIONERS_FAILURE:
      case ADD_KUESIONER_FAILURE:
      case UPDATE_KUESIONER_FAILURE:
      case DELETE_KUESIONER_FAILURE:
        return { ...state, loading: false, error: action.error, validation: action?.validation, action_type:action.type };
  
      case SET_KUESIONERS: // Handle the action for setting bank soals
        return {
          ...state,
          kuesioners: {
            ...state.kuesioners,
            record: action.payload, // Set updated bank soals
            action_type:action.type
          }
        };

      default:
        return state;
    }
  };
  
  export default kuesionerReducer;
  