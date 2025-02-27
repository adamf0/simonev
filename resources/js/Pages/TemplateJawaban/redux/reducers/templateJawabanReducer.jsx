  import {
    FETCH_TEMPLATE_JAWABANS_REQUEST,
    FETCH_TEMPLATE_JAWABANS_SUCCESS,
    FETCH_TEMPLATE_JAWABANS_FAILURE,
    ADD_TEMPLATE_JAWABAN_REQUEST,
    ADD_TEMPLATE_JAWABAN_SUCCESS,
    ADD_TEMPLATE_JAWABAN_FAILURE,
    UPDATE_TEMPLATE_JAWABAN_REQUEST,
    UPDATE_TEMPLATE_JAWABAN_SUCCESS,
    UPDATE_TEMPLATE_JAWABAN_FAILURE,
    DELETE_TEMPLATE_JAWABAN_REQUEST,
    DELETE_TEMPLATE_JAWABAN_SUCCESS,
    DELETE_TEMPLATE_JAWABAN_FAILURE,
    SET_TEMPLATE_JAWABANS
  } from '../actions/templateJawabanActions';
  
  const initialState = {
    templateJawabans: {
      record: [],
    },
    loading: false,
    error: null,
    validation: null,
    action_type: null
  };
  
  const templateJawabanReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_TEMPLATE_JAWABANS_REQUEST:
      case ADD_TEMPLATE_JAWABAN_REQUEST:
      case UPDATE_TEMPLATE_JAWABAN_REQUEST:
      case DELETE_TEMPLATE_JAWABAN_REQUEST:
        return { ...state, loading: true, action_type:action.type };
  
      case FETCH_TEMPLATE_JAWABANS_SUCCESS:
        return {
          ...state,
          templateJawabans: {
            record: action.payload,
          },
          loading: false, 
          action_type:action.type
        };

      case ADD_TEMPLATE_JAWABAN_SUCCESS:
      case UPDATE_TEMPLATE_JAWABAN_SUCCESS:
      case DELETE_TEMPLATE_JAWABAN_SUCCESS:
        return { ...state, loading: false, action_type:action.type };
  
      case FETCH_TEMPLATE_JAWABANS_FAILURE:
      case ADD_TEMPLATE_JAWABAN_FAILURE:
      case UPDATE_TEMPLATE_JAWABAN_FAILURE:
      case DELETE_TEMPLATE_JAWABAN_FAILURE:
        return { ...state, loading: false, error: action.error, validation: action?.validation, action_type:action.type };
  
      case SET_TEMPLATE_JAWABANS: // Handle the action for setting bank soals
        return {
          ...state,
          templateJawabans: {
            ...state.templateJawabans,
            record: action.payload, // Set updated bank soals
            action_type:action.type
          }
        };
      default:
        return state;
    }
  };
  
  export default templateJawabanReducer;
  