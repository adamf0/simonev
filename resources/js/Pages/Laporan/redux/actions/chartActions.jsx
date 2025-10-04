// import axios from 'axios';

// export const FETCH_CHART_REQUEST = 'FETCH_CHART_REQUEST';
// export const FETCH_CHART_SUCCESS = 'FETCH_CHART_SUCCESS';
// export const FETCH_CHART_FAILURE = 'FETCH_CHART_FAILURE';

// const api_chart = '/api/kuesioner/laporanv2';

// export const fetchChart = (id_bank_soal, target='', target_value='') => {
//   return async (dispatch) => {
//     dispatch({ type: FETCH_CHART_REQUEST });
//     try {
//       const response = await axios.get(`${api_chart}/${id_bank_soal}?target=${target}&target_value=${target_value}`);
//       dispatch({ type: FETCH_CHART_SUCCESS, payload: response.data });
//     } catch (error) {
//       dispatch({ type: FETCH_CHART_FAILURE, error });
//     }
//   };
// };

export const FETCH_CHART_REQUEST = 'FETCH_CHART_REQUEST';
export const FETCH_CHART_SUCCESS = 'FETCH_CHART_SUCCESS';
export const FETCH_CHART_FAILURE = 'FETCH_CHART_FAILURE';

const api_chart = '/api/kuesioner/laporanv2';

export const fetchChart = (id_bank_soal, target = '', target_value = '') => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CHART_REQUEST });

    try {
      const response = await fetch(`${api_chart}/${id_bank_soal}?target=${target}&target_value=${target_value}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let resultObject = {}; // ini akan menampung JSON akhir seperti sebelumnya

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Pisahkan baris per baris NDJSON
        let lines = buffer.split('\n');
        buffer = lines.pop(); // simpan sisa incomplete line

        for (const line of lines) {
          if (line.trim() === '') continue;
          try {
            const parsed = JSON.parse(line);

            // Gabungkan ke object akhir — tergantung struktur NDJSON server
            // Misalnya tiap line punya key seperti "Keterpahaman VMTS ..." → kita merge
            resultObject = { ...resultObject, ...parsed };
          } catch (err) {
            console.error('Gagal parse NDJSON line:', line, err);
          }
        }
      }

      // parse sisa buffer jika ada
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          resultObject = { ...resultObject, ...parsed };
        } catch (err) {
          console.error('Gagal parse NDJSON buffer akhir:', buffer, err);
        }
      }

      dispatch({ type: FETCH_CHART_SUCCESS, payload: resultObject });

    } catch (error) {
      console.error('Fetch chart NDJSON error:', error);
      dispatch({ type: FETCH_CHART_FAILURE, error: error.message });
    }
  };
};
