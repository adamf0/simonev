import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportRekapSSE = (filters, onProgress) => {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams(filters).toString();
    const url = `https://simonev-lpm.unpak.ac.id/api/kuesioner/stream-rekap?${params}`;

    const eventSource = new EventSource(url);

    const rows = [];
    let total = 0;

    /*
    =========================
    START
    =========================
    */
    eventSource.addEventListener("start", (e) => {
      const data = JSON.parse(e.data);
      total = data.total || 0;

      console.log("Streaming started:", total);
    });

    /*
    =========================
    ROW
    =========================
    */
    eventSource.addEventListener("row", (e) => {
      const d = JSON.parse(e.data);

      rows.push({
        Tanggal: d.tanggal || "",
        Peruntukan: d.peruntukan || "",
        Bank_Soal: d.bankSoal || "",

        Nama_Mahasiswa: d.nama_mahasiswa || "",
        Fakultas_Mahasiswa: d.nama_fakultas_mahasiswa || "",
        Prodi_Mahasiswa: d.nama_prodi_mahasiswa || "",

        Nama_Dosen: d.nama_dosen || "",
        Fakultas_Dosen: d.nama_fakultas_dosen || "",
        Prodi_Dosen: d.nama_prodi_dosen || "",

        Nama_Tendik: d.nama_tendik || "",
        Unit_Kerja: d.unit_kerja || "",
      });
    });

    /*
    =========================
    PROGRESS (OPTIONAL)
    =========================
    */
    eventSource.addEventListener("progress", (e) => {
      const p = JSON.parse(e.data);

      if (onProgress) {
        onProgress({
          current: p.current,
          total: p.total,
          percent: ((p.current / p.total) * 100).toFixed(2),
        });
      }
    });

    /*
    =========================
    END
    =========================
    */
    eventSource.addEventListener("end", (e) => {
      const meta = JSON.parse(e.data);

      console.log("Streaming finished:", meta.total);

      /*
      =========================
      SHEET 1 (DETAIL)
      =========================
      */
      const wsDetail = XLSX.utils.json_to_sheet(rows);

      /*
      =========================
      SHEET 2 (REKAP)
      =========================
      */
      const rekapMap = {};

      rows.forEach((r) => {
        // 🔥 PRIORITAS GROUPING
        let key = "";

        if (r.Unit_Kerja) {
          key = `Tendik - ${r.Unit_Kerja}`;
        } else if (r.Prodi_Dosen) {
          key = `Dosen - ${r.Fakultas_Dosen} - ${r.Prodi_Dosen}`;
        } else if (r.Prodi_Mahasiswa) {
          key = `Mahasiswa - ${r.Fakultas_Mahasiswa} - ${r.Prodi_Mahasiswa}`;
        } else {
          key = "Tidak diketahui";
        }

        if (!rekapMap[key]) {
          rekapMap[key] = 0;
        }

        rekapMap[key]++;
      });

      const rekapArray = Object.entries(rekapMap).map(([k, v]) => {
        const [kategori, group] = k.includes(" - ")
          ? [k.split(" - ")[0], k.replace(`${k.split(" - ")[0]} - `, "")]
          : ["unknown", k];

        return {
          Kategori: kategori,
          Group: group,
          Total: v,
        };
      });

      const wsRekap = XLSX.utils.json_to_sheet(rekapArray);

      /*
      =========================
      WORKBOOK
      =========================
      */
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, wsRekap, "Data Rekap");
      XLSX.utils.book_append_sheet(wb, wsDetail, "General Info");

      const excelBuffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
      });

      const file = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(file, "rekap_kuesioner.xlsx");

      eventSource.close();
      resolve(true);
    });

    /*
    =========================
    ERROR
    =========================
    */
    eventSource.onerror = (err) => {
      console.error("SSE error", err);
      eventSource.close();
      reject(err);
    };
  });
};