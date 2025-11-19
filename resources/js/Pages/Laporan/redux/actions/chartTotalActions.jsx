export const FETCH_CHART_TOTAL_REQUEST = "FETCH_CHART_TOTAL_REQUEST";
export const FETCH_CHART_TOTAL_START   = "FETCH_CHART_TOTAL_START";
export const FETCH_CHART_TOTAL_CHUNK   = "FETCH_CHART_TOTAL_CHUNK";
export const FETCH_CHART_TOTAL_SUCCESS = "FETCH_CHART_TOTAL_SUCCESS";
export const FETCH_CHART_TOTAL_FAILURE = "FETCH_CHART_TOTAL_FAILURE";

export const fetchChartTotal = (id_bank_soal, target = "", target_value = "") => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CHART_TOTAL_REQUEST });

    try {
      // tutup SSE lama jika masih hidup
      if (window.__SSE_CHART_TOTAL__) {
        window.__SSE_CHART_TOTAL__.close();
      }

      const url = `/api/kuesioner/chart/${id_bank_soal}?target=${target}&target_value=${target_value}`;
      const source = new EventSource(url);
      window.__SSE_CHART_TOTAL__ = source;

      dispatch({ type: FETCH_CHART_TOTAL_START });

      // Saat backend kirim 500 row per chunk:
      source.addEventListener("chunk", (evt) => {
        const rows = JSON.parse(evt.data); // always array
        dispatch({
          type: FETCH_CHART_TOTAL_CHUNK,
          payload: rows
        });
      });

      source.addEventListener("done", () => {
        dispatch({ type: FETCH_CHART_TOTAL_SUCCESS });
        source.close();
      });

      source.onerror = (err) => {
        dispatch({
          type: FETCH_CHART_TOTAL_FAILURE,
          error: err
        });
        source.close();
      };

    } catch (error) {
      dispatch({
        type: FETCH_CHART_TOTAL_FAILURE,
        error
      });
    }
  };
};
