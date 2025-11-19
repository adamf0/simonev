import axios from 'axios';

export const FETCH_CHART_REQUEST = "FETCH_CHART_REQUEST";
export const FETCH_CHART_START = "FETCH_CHART_START"; // total pertanyaan
export const FETCH_CHART_CHUNK = "FETCH_CHART_CHUNK"; // per-pertanyaan
export const FETCH_CHART_SUCCESS = "FETCH_CHART_SUCCESS";
export const FETCH_CHART_FAILURE = "FETCH_CHART_FAILURE";

const api_chart = '/api/tes/all';

export const fetchChartSSE = (id_bank_soal, target = "", target_value = "") => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CHART_REQUEST });

    try {
      // Tutup koneksi SSE sebelumnya (jika ada)
      if (window.__SSE_CHART__) {
        window.__SSE_CHART__.close();
      }

      const url = `${api_chart}`; // /${id_bank_soal}/stream?target=${target}&target_value=${target_value}
      const source = new EventSource(url);
      window.__SSE_CHART__ = source;

      // 🟦 Event: start
      source.addEventListener("start", (evt) => {
        const payload = JSON.parse(evt.data);
        dispatch({
          type: FETCH_CHART_START,
          payload,
        });
      });

      // 🟩 Event: per pertanyaan
      source.addEventListener("pertanyaan", (evt) => {
        const chunk = JSON.parse(evt.data);

        dispatch({
          type: FETCH_CHART_CHUNK,
          payload: chunk,
        });
      });

      // 🟧 Event: selesai
      source.addEventListener("done", () => {
        dispatch({ type: FETCH_CHART_SUCCESS });
        source.close();
      });

      // 🔴 Event Error
      source.onerror = (err) => {
        dispatch({ type: FETCH_CHART_FAILURE, error: err });
        source.close();
      };
    } catch (error) {
      dispatch({ type: FETCH_CHART_FAILURE, error });
    }
  };
};