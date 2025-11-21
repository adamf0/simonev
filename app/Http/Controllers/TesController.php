<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\Kuesioner;
use App\Models\Prodi;
use App\Models\TemplatePertanyaan;
use App\Models\TemplatePilihan;
use App\Models\VKuesioner;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;

class TesController extends Controller
{
    function index(){
        return Inertia::render('Tes', []);
    }
    function all() {
        // Header SSE
        // header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('X-Accel-Buffering: no'); // Untuk nginx / cloudflare

        $id_bank_soal = "110";
        $target = "prodi";
        $target_value = "ILMU HUKUM (S1)";

        $branchBankSoal = BankSoal::where("branch", $id_bank_soal)->first()?->id;

        // 1️⃣ Ambil semua pertanyaan unik
        $pertanyaanList = TemplatePertanyaan::with(['TemplatePilihan', 'Kategori', 'SubKategori'])
            ->whereIn('id_bank_soal', [$id_bank_soal, $branchBankSoal])
            ->get()
            ->groupBy('pertanyaan');

        // 2️⃣ Ambil template jawaban
        $allJawabanIds = TemplatePilihan::whereIn(
            'id_template_soal',
            $pertanyaanList->flatten()->pluck('id')->toArray()
        )->get();

        // Kirim jumlah pertanyaan dulu
        // $this->sendSSE("start", [
        //     "total_pertanyaan" => count($pertanyaanList)
        // ]);

        // 3️⃣ Loop seperti sebelumnya — per pertanyaan
        dd($pertanyaanList->get("Di dalam melaksanakan kegiatan di lingkup Universitas Pakuan, saya menggunakan visi dan misi Universitas Pakuan sebagai acuan"), $allJawabanIds);
        foreach ($pertanyaanList as $pertanyaanText => $pertGroup) {

            $detail = collect();

            $jawabanGroup = $allJawabanIds->whereIn(
                'id_template_soal',
                $pertGroup->pluck('id')
            );

            // Gabungan per jawaban
            foreach ($jawabanGroup->groupBy('jawaban') as $jawabanValue => $jawabanItems) {

                // Query total jawaban seperti versi lama
                $total = Kuesioner::with(['tendik'])
                    ->join('kuesioner_jawaban as kj', 'kj.id_kuesioner', '=', 'kuesioner.id')
                    ->whereIn('kuesioner.id_bank_soal', [$id_bank_soal, $branchBankSoal])
                    ->whereIn('id_template_pertanyaan', $pertGroup->pluck('id'))
                    ->whereIn('id_template_jawaban', $jawabanItems->pluck('id'));

                if($pertanyaanText=="Di dalam melaksanakan kegiatan di lingkup Universitas Pakuan, saya menggunakan visi dan misi Universitas Pakuan sebagai acuan"){
                    dd($total->toRawSql());
                }

                // Filtering
                if (!empty($target_value)) {
                    $total = $this->applyTargetFilter($total, $target_value);
                }

                $detail->push([
                    "jawaban" => $jawabanValue,
                    "total" => $total->count(),
                ]);
            }

            // Build chart (versi sama persis)
            $labels = $detail->pluck('jawaban')->toArray();
            $data = $detail->pluck('total')->toArray();
            $colors = $this->generateRandomColors(count($labels));

            $charts = [
                "labels" => $labels,
                "datasets" => [
                    [
                        "label" => "Dataset",
                        "data" => $data,
                        "backgroundColor" => $colors,
                        "borderColor" => $colors,
                        "borderWidth" => 1
                    ]
                ]
            ];

            // 4️⃣ Kirim SSE chunk Untuk satu pertanyaan
            // $this->sendSSE("pertanyaan", [
            //     "pertanyaan" => $pertanyaanText,
            //     "kategori" => $pertGroup->first()->Kategori?->nama_kategori,
            //     "subKategori" => $pertGroup->first()->SubKategori?->nama_sub,
            //     "jenis_pilihan" => $pertGroup->first()->jenis_pilihan,
            //     "chart" => $charts,
            // ]);
        }

        // 5️⃣ kirim selesai
        // $this->sendSSE("done", ["message" => "completed"]);
        exit;
    }

    function applyTargetFilter($query, $target_value)
    {
        return $query->where(function ($query) use ($target_value) {

            // Mahasiswa
            $query->whereExists(function ($sub) use ($target_value) {
                $sub->select(DB::raw(1))
                    ->from('m_mahasiswa_simak')
                    ->join('m_program_studi', 'm_program_studi.kode_prodi', '=', 'm_mahasiswa_simak.kode_prodi')
                    ->whereColumn('kuesioner.npm', 'm_mahasiswa_simak.NIM')
                    ->whereRaw("
                        concat(
                            m_program_studi.nama_prodi, 
                            CASE 
                                WHEN m_program_studi.kode_jenjang='C' THEN ' (S1)' 
                                WHEN m_program_studi.kode_jenjang='B' THEN ' (S2)' 
                                WHEN m_program_studi.kode_jenjang='A' THEN ' (S3)' 
                                WHEN m_program_studi.kode_jenjang='E' THEN ' (D3)' 
                                WHEN m_program_studi.kode_jenjang='D' THEN ' (D4)' 
                                WHEN m_program_studi.kode_jenjang='J' THEN ' (Profesi)' 
                                ELSE '' 
                            END
                        ) = ?", [$target_value]);
            })

            // Dosen
            ->orWhereExists(function ($sub) use ($target_value) {
                $sub->select(DB::raw(1))
                    ->from('m_dosen_simak')
                    ->join('m_program_studi', 'm_program_studi.kode_prodi', '=', 'm_dosen_simak.kode_prodi')
                    ->whereColumn('kuesioner.nidn', 'm_dosen_simak.NIDN')
                    ->whereRaw("
                        concat(
                            m_program_studi.nama_prodi, 
                            CASE 
                                WHEN m_program_studi.kode_jenjang='C' THEN ' (S1)' 
                                WHEN m_program_studi.kode_jenjang='B' THEN ' (S2)' 
                                WHEN m_program_studi.kode_jenjang='A' THEN ' (S3)' 
                                WHEN m_program_studi.kode_jenjang='E' THEN ' (D3)' 
                                WHEN m_program_studi.kode_jenjang='D' THEN ' (D4)' 
                                WHEN m_program_studi.kode_jenjang='J' THEN ' (Profesi)' 
                                ELSE '' 
                            END
                        ) = ?", [$target_value]);
            })

            // Tendik
            ->orWhereHas('tendik', function ($sub) use ($target_value) {
                $sub->where('unit', $target_value);
            });
        });
    }

    function generateRandomColors($count, $random=true){
        $colors = [];
        
        while (count($colors) < $count) {
            // Generate random RGB values
            $r = $random? rand(50, 255):0;  // Avoid 0 (black) and ensure enough color range
            $g = $random? rand(50, 255):0;  // Avoid 0 (black) and ensure enough color range
            $b = $random? rand(50, 255):255;  // Avoid 0 (black) and ensure enough color range
            
            // Generate RGBA color with random transparency
            $rgba = "rgba($r, $g, $b, 1)"; // 0.5 is the transparency value
            
            // Avoid too light (white) and too dark (black)
            if (!in_array($rgba, $colors)) {
                $colors[] = $rgba;
            }
        }

        return $colors;
    }

    function sendSSE($event, $data)
    {
        echo "event: $event\n";
        echo "data: " . json_encode($data) . "\n\n";
        @ob_flush();
        @flush();
    }

}
