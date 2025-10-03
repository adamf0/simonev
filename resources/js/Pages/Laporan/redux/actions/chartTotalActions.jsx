import axios from 'axios';

export const FETCH_CHART_TOTAL_REQUEST = 'FETCH_CHART_TOTAL_REQUEST';
export const FETCH_CHART_TOTAL_SUCCESS = 'FETCH_CHART_TOTAL_SUCCESS';
export const FETCH_CHART_TOTAL_FAILURE = 'FETCH_CHART_TOTAL_FAILURE';

export const fetchChartTotal = (id_bank_soal, target='', target_value='') => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CHART_TOTAL_REQUEST });

    try {
      const response = await fetch(`/api/kuesioner/chart/${id_bank_soal}?target=${target}&target_value=${target_value}`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let allItems = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // sisa partial JSON

        for (let line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (Array.isArray(parsed)) {
                allItems.push(...parsed);
              } else {
                allItems.push(parsed);
              }
            } catch (err) {
              console.error("JSON parse error:", err, line);
            }
          }
        }
      }

      // parsing sisa buffer
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (Array.isArray(parsed)) {
            allItems.push(...parsed);
          } else {
            allItems.push(parsed);
          }
        } catch (err) {
          console.error("JSON parse error (final buffer):", err, buffer);
        }
      }

      dispatch({ type: FETCH_CHART_TOTAL_SUCCESS, payload: allItems });
    } catch (error) {
      dispatch({ type: FETCH_CHART_TOTAL_FAILURE, error });
    }
  };
};