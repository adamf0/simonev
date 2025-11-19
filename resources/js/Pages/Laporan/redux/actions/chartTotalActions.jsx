export const FETCH_CHART_TOTAL_REQUEST = "FETCH_CHART_TOTAL_REQUEST";
export const FETCH_CHART_TOTAL_START   = "FETCH_CHART_TOTAL_START";
export const FETCH_CHART_TOTAL_CHUNK   = "FETCH_CHART_TOTAL_CHUNK";
export const FETCH_CHART_TOTAL_SUCCESS = "FETCH_CHART_TOTAL_SUCCESS";
export const FETCH_CHART_TOTAL_FAILURE = "FETCH_CHART_TOTAL_FAILURE";

export const fetchChartTotal = (
  id_bank_soal,
  target = "",
  target_value = ""
) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CHART_TOTAL_REQUEST });

    try {
      // tutup SSE sebelumnya
      if (window.__SSE_CHART_TOTAL__) {
        window.__SSE_CHART_TOTAL__.close();
      }

      const url = `/api/kuesioner/chart/${id_bank_soal}?target=${target}&target_value=${target_value}`;
      const source = new EventSource(url);
      window.__SSE_CHART_TOTAL__ = source;

      // start event
      dispatch({ type: FETCH_CHART_TOTAL_START });

      // CHUNK event
      source.addEventListener("chunk", (evt) => {
        const rows = JSON.parse(evt.data);
        dispatch({
          type: FETCH_CHART_TOTAL_CHUNK,
          payload: rows,
        });
      });

      // DONE event
      source.addEventListener("done", () => {
        dispatch({ type: FETCH_CHART_TOTAL_SUCCESS });
        source.close();
      });

      // ERROR event
      source.onerror = (err) => {
        dispatch({
          type: FETCH_CHART_TOTAL_FAILURE,
          error: err,
        });
        source.close();
      };

    } catch (error) {
      dispatch({
        type: FETCH_CHART_TOTAL_FAILURE,
        error,
      });
    }
  };
};
