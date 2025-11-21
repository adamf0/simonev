<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\Dosen;
use App\Models\Fakultas;
use App\Models\Kuesioner;
use App\Models\KuesionerJawaban;
use App\Models\Mahasiswa;
use App\Models\Pengangkatan;
use App\Models\Prodi;
use App\Models\TemplatePertanyaan;
use App\Models\TemplatePilihan;
use App\Models\VKuesioner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use InvalidArgumentException;

class LaporanApiController extends Controller
{
    private function generateRandomColors($count, $random=true){
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

    public function rekap(Request $request)
    {
        DB::statement("
            CREATE TEMPORARY TABLE temp_vtendik AS
            SELECT nip, nidn, MAX(nama) AS nama, MAX(fakultas) AS fakultas, MAX(unit) AS unit
            FROM (
                SELECT 
                    CASE WHEN e_pribadi_simpeg.nip = 0 THEN '' ELSE e_pribadi_simpeg.nip END AS nip,
                    e_pribadi_simpeg.nidn,
                    e_pribadi_simpeg.nama,
                    payroll_m_pegawai.fakultas,
                    NULL AS unit
                FROM e_pribadi_simpeg
                LEFT JOIN payroll_m_pegawai ON payroll_m_pegawai.nip = e_pribadi_simpeg.nip

                UNION ALL

                SELECT 
                    CASE WHEN n_pribadi_simpeg.nip = 0 THEN '' ELSE n_pribadi_simpeg.nip END AS nip,
                    NULL AS nidn,
                    n_pribadi_simpeg.nama,
                    NULL AS fakultas,
                    n_pengangkatan_simpeg.unit_kerja AS unit
                FROM n_pribadi_simpeg
                LEFT JOIN n_pengangkatan_simpeg ON n_pengangkatan_simpeg.nip = n_pribadi_simpeg.nip
            ) a
            GROUP BY a.nidn, a.nip
        ");

        $query = DB::table("kuesioner as k")
                    ->distinct()
                    ->select(
                        'k.id',
                        'k.nidn',
                        'k.nip',
                        'k.npm',
                        'k.id_bank_soal',
                        'k.tanggal',
                        'bank_soal.peruntukan',
                        'bank_soal.judul as bankSoal',
                        'm_mahasiswa_simak.nama_mahasiswa',
                        'm_mahasiswa_simak.kode_fak as mahasiswa_kode_fakultas',
                        'm_mahasiswa_simak.kode_prodi as mahasiswa_kode_prodi',
                        'tDosen.nama as nama_dosen',
                        'm_dosen_simak.kode_prodi as dosen_kode_prodi',
                        'm_dosen_simak.kode_fak as dosen_kode_fakultas',
                        'tTendik.nama as nama_tendik',
                        'n_pengangkatan_simpeg.unit_kerja',
                    )
                    ->join('bank_soal', 'k.id_bank_soal', '=', 'bank_soal.id')
                    ->leftJoin('temp_vtendik as tDosen', 'k.nidn', '=', 'tDosen.nidn')
                    ->leftJoin(DB::raw("(SELECT nidn, kode_fak, kode_prodi FROM m_dosen_simak) as m_dosen_simak"), 'm_dosen_simak.nidn', '=', 'tDosen.nidn')
                    ->leftJoin('temp_vtendik as tTendik', 'k.nip', '=', 'tTendik.nip')
                    ->leftJoin(DB::raw("(SELECT nip, unit_kerja FROM n_pengangkatan_simpeg) as n_pengangkatan_simpeg"), 'tTendik.nip', '=', 'n_pengangkatan_simpeg.nip')
                    ->leftJoin(DB::raw("(SELECT nim, nama_mahasiswa, kode_fak, kode_prodi FROM m_mahasiswa_simak) as m_mahasiswa_simak"), 'k.npm', '=', 'm_mahasiswa_simak.nim')
                    ->where(
                        DB::raw("(SELECT COUNT(0) FROM template_pertanyaan tp WHERE tp.id_bank_soal = k.id_bank_soal AND tp.required = 1)"),
                        '<=',
                        DB::raw('(SELECT COUNT(0) FROM kuesioner_jawaban kj JOIN template_pertanyaan tp2 ON kj.id_template_pertanyaan = tp2.id WHERE kj.id_kuesioner = k.id AND tp2.required = 1)')
                    );

        if($request->start_date && $request->end_date){
            $query = $query->whereBetween('tanggal',[$request->start_date, $request->end_date]);
        }
        if($request->level=="fakultas" || !empty($request->fakultas)){
            $query = $query->where('m_mahasiswa_simak.kode_fak', $request->fakultas);
        }
        if($request->level=="prodi" || !empty($request->prodi)){
            $query = $query->where('m_mahasiswa_simak.kode_prodi', $request->prodi);
        }
        if(!empty($request->npm)){
            $query = $query->where('npm',$request->npm);
        }
        if(!empty($request->bankSoal)){
            $query = $query->where('k.id_bank_soal',$request->bankSoal);
        } else{
            return response()->json([
                'data' => [],
                'currentPage' => 0,
                'total' => 0,
                'lastPage' => 0,
            ]);
        }

        if($request->level=="admin"){
            if(!empty($request->nidn)){
                $query = $query->where('nidn',$request->nidn);
            }
            if(!empty($request->nip)){
                $query = $query->where('nip',$request->nip);
            }
            if(!empty($request->unit)){
                $query = $query->where('n_pengangkatan_simpeg.unit_kerja',$request->unit);
            }
        } else if($request->level=="prodi" || $request->level=="fakultas"){
            $query = $query->whereNotNull('k.npm');
        }
        
        $totalRecords = $query->get()->count();
        $kuesioner = $query->paginate(5);

        return response()->json([
            'data' => $kuesioner->getCollection(),
            'currentPage' => $kuesioner->currentPage(),
            'total' => $totalRecords,
            'lastPage' => $kuesioner->lastPage(),
        ]);
    }

    // public function chart($id_bank_soal, Request $request){
    //     set_time_limit(0);
    //     ini_set('output_buffering', 'off');
    //     ini_set('zlib.output_compression', false);
    //     set_time_limit(0);
    //     ob_implicit_flush(true);
        
    //     if(in_array($id_bank_soal, ["","undefinied",null])){
    //         throw new InvalidArgumentException("bank soal '$id_bank_soal' tidak terdaftar di sistem");
    //     }

    //     $branchBankSoal = BankSoal::where("branch",$id_bank_soal)->first()?->id;

    //     $totalChunks = 0;

    //     $target = $request?->target;
    //     $target_value = $request?->target_value;

    //     return Response::stream(function () use (&$totalChunks, &$id_bank_soal, &$branchBankSoal, $target , $target_value ) {
    //             $query = VKuesioner::with([
    //                 'Mahasiswa'=>fn($q)=>$q->select("kode_fak","kode_prodi","NIM","nama_mahasiswa"),
    //                 'Mahasiswa.Fakultas'=>fn($q)=>$q->select("kode_fakultas","nama_fakultas"),
    //                 'Mahasiswa.Prodi'=>fn($q)=>$q->select("kode_prodi",DB::raw('(
    //                     concat(
    //                         nama_prodi,
    //                         case 
    //                             when kode_jenjang = "C" then " (S1)"
    //                             when kode_jenjang = "B" then " (S2)"
    //                             when kode_jenjang = "A" then " (S3)"
    //                             when kode_jenjang = "E" then " (D3)"
    //                             when kode_jenjang = "D" then " (D4)"
    //                             when kode_jenjang = "J" then " (Profesi)"
    //                             else "?"
    //                         end
    //                     )    
    //                 ) as nama_prodi_jenjang'), "nama_prodi"),
    //                 'Dosen'=>fn($q)=>$q->select("kode_fak","kode_prodi","NIDN","nama_dosen"),
    //                 'Dosen.Fakultas'=>fn($q)=>$q->select("kode_fakultas","nama_fakultas"),
    //                 'Dosen.Prodi'=>fn($q)=>$q->select("kode_prodi",DB::raw('(
    //                     concat(
    //                         nama_prodi,
    //                         case 
    //                             when kode_jenjang = "C" then " (S1)"
    //                             when kode_jenjang = "B" then " (S2)"
    //                             when kode_jenjang = "A" then " (S3)"
    //                             when kode_jenjang = "E" then " (D3)"
    //                             when kode_jenjang = "D" then " (D4)"
    //                             when kode_jenjang = "J" then " (Profesi)"
    //                             else "?"
    //                         end
    //                     )    
    //                 ) as nama_prodi_jenjang'), "nama_prodi"),
    //                 'Tendik',
    //             ]);
                
    //             if (!empty($target) && !empty($target_value)) {
    //                 $query = $query->where(function($q) use ($target_value) {
    //                     $q->whereHas('Mahasiswa.Prodi', function($q2) use ($target_value) {
    //                         if (preg_match('/^(.*) \((.*)\)$/', $target_value, $matches)) {
    //                             $nama = $matches[1];
    //                             $jenjang = match($matches[2]) {
    //                                 'S1' => 'C',
    //                                 'S2' => 'B',
    //                                 'S3' => 'A',
    //                                 'D3' => 'E',
    //                                 'D4' => 'D',
    //                                 'Profesi' => 'J',
    //                                 default => null
    //                             };
    //                             $q2->where('nama_prodi', $nama)
    //                             ->where('kode_jenjang', $jenjang);
    //                         }
    //                     })
    //                     ->orWhereHas('Dosen.Prodi', function($q2) use ($target_value) {
    //                         if (preg_match('/^(.*) \((.*)\)$/', $target_value, $matches)) {
    //                             $nama = $matches[1];
    //                             $jenjang = match($matches[2]) {
    //                                 'S1' => 'C',
    //                                 'S2' => 'B',
    //                                 'S3' => 'A',
    //                                 'D3' => 'E',
    //                                 'D4' => 'D',
    //                                 'Profesi' => 'J',
    //                                 default => null
    //                             };
    //                             $q2->where('nama_prodi', $nama)
    //                             ->where('kode_jenjang', $jenjang);
    //                         }
    //                     })
    //                     ->orWhereHas('Tendik', function($q2) use ($target_value) {
    //                         $q2->where('unit', $target_value);
    //                     });
    //                 });
    //             }        

    //             $query = $query->whereIn("id_bank_soal",[$id_bank_soal, $branchBankSoal])
    //             ->chunk(500, function ($rows) use (&$totalChunks) {
    //             $batch = $rows->map(function ($row) {
    //                 return [
    //                     'id'    => $row->id,
    //                     'nidn'  => $row->nidn,
    //                     'nip' => $row->nip,
    //                     'npm' => $row->npm,
    //                     'id_bank_soal' => $row->id_bank_soal,
    //                     'status_pengisian' => $row->statusPengisian,
    //                     'mhs' => $row?->Mahasiswa,
    //                     'dosen' => $row?->Dosen,
    //                     'tendik' => $row?->Tendik,
    //                 ];
    //             });
        
    //             echo json_encode($batch) . "\n";
    //             $totalChunks++;
        
    //             ob_flush();
    //             flush();
    //             });
    //     }, 200, [
    //         'Content-Type' => 'application/x-ndjson',
    //         'Cache-Control' => 'no-cache',
    //         'Connection' => 'keep-alive',
    //         'X-Accel-Buffering' => 'no',
    //     ]);
    // }
    public function chart($id_bank_soal, Request $request){
        // Header SSE
        header("Content-Type: text/event-stream");
        header("Cache-Control: no-cache");
        header("Connection: keep-alive");
        header("X-Accel-Buffering: no");

        ob_implicit_flush(true);
        @ob_end_flush();

        if (in_array($id_bank_soal, ["", "undefined", null])) {
            $this->sendSSE("error", ["message" => "bank soal '$id_bank_soal' tidak terdaftar"]);
            return;
        }

        $branchBankSoal = BankSoal::where("branch", $id_bank_soal)->get()->pluck("id")->toArray();
        $targetBanksoal = array_merge($branchBankSoal, [$id_bank_soal]);
        $target = $request->target;
        $target_value = $request->target_value;

        // Query sama seperti sebelumnya
        $query = VKuesioner::with([
            'Mahasiswa' => fn($q) => $q->select(
                "kode_fak",
                "kode_prodi",
                "NIM",
                "nama_mahasiswa"
            ),
        
            'Mahasiswa.Fakultas' => fn($q) => $q->select(
                "kode_fakultas",
                "nama_fakultas"
            ),
        
            'Mahasiswa.Prodi' => fn($q) => $q->select(
                "kode_prodi",
                "nama_prodi",
                DB::raw("
                    CONCAT(
                        nama_prodi, 
                        ' (',
                        CASE kode_jenjang
                            WHEN 'A' THEN 'S3'
                            WHEN 'B' THEN 'S2'
                            WHEN 'C' THEN 'S1'
                            WHEN 'D' THEN 'D4'
                            WHEN 'E' THEN 'D3'
                            WHEN 'J' THEN 'Profesi'
                            ELSE kode_jenjang
                        END,
                        ')'
                    ) AS nama_prodi_jenjang
                ")
            ),
        
            'Dosen' => fn($q) => $q->select(
                "kode_fak",
                "kode_prodi",
                "NIDN",
                "nama_dosen"
            ),
        
            'Dosen.Fakultas' => fn($q) => $q->select(
                "kode_fakultas",
                "nama_fakultas"
            ),
        
            'Dosen.Prodi' => fn($q) => $q->select(
                "kode_prodi",
                "nama_prodi",
                DB::raw("
                    CONCAT(
                        nama_prodi, 
                        ' (',
                        CASE kode_jenjang
                            WHEN 'A' THEN 'S3'
                            WHEN 'B' THEN 'S2'
                            WHEN 'C' THEN 'S1'
                            WHEN 'D' THEN 'D4'
                            WHEN 'E' THEN 'D3'
                            WHEN 'J' THEN 'Profesi'
                            ELSE kode_jenjang
                        END,
                        ')'
                    ) AS nama_prodi_jenjang
                ")
            ),
        
            'Tendik',
        ]);       

        // FILTER sesuai kode kamu (tidak diubah)
        if (!empty($target) && !empty($target_value)) {
            $query = $query->where(function ($q) use ($target_value) {
                $q->whereHas('Mahasiswa.Prodi', function ($q2) use ($target_value) {
                    if (preg_match('/^(.*) \((.*)\)$/', $target_value, $matches)) {
                        $nama = $matches[1];
                        $jenjang = match($matches[2]) {
                            'S1' => 'C',
                            'S2' => 'B',
                            'S3' => 'A',
                            'D3' => 'E',
                            'D4' => 'D',
                            'Profesi' => 'J',
                            default => null
                        };
                        $q2->where('nama_prodi', $nama)
                        ->where('kode_jenjang', $jenjang);
                    }
                })
                ->orWhereHas('Dosen.Prodi', function ($q2) use ($target_value) {
                    if (preg_match('/^(.*) \((.*)\)$/', $target_value, $matches)) {
                        $nama = $matches[1];
                        $jenjang = match($matches[2]) {
                            'S1' => 'C',
                            'S2' => 'B',
                            'S3' => 'A',
                            'D3' => 'E',
                            'D4' => 'D',
                            'Profesi' => 'J',
                            default => null
                        };
                        $q2->where('nama_prodi', $nama)
                        ->where('kode_jenjang', $jenjang);
                    }
                })
                ->orWhereHas('Tendik', fn($q3) => $q3->where('unit', $target_value));
            });
        }

        // STREAM dengan CHUNK 500
        $query->whereIn("id_bank_soal", $targetBanksoal)
            ->chunk(500, function ($rows) {

                $batch = $rows->map(fn($row) => [
                    'id'               => $row->id,
                    'nidn'             => $row->nidn,
                    'nip'              => $row->nip,
                    'npm'              => $row->npm,
                    'id_bank_soal'     => $row->id_bank_soal,
                    'status_pengisian' => $row->statusPengisian,
                    'mhs'              => $row?->Mahasiswa,
                    'dosen'            => $row?->Dosen,
                    'tendik'           => $row?->Tendik,
                ]);

                $this->sendSSE("chunk", $batch);
            });

        // END EVENT
        $this->sendSSE("done", "selesai");
    }
    public function chartLabel($id_bank_soal, $type){
        if(!in_array($type, ["fakultas","prodi","unit"])){
            throw new InvalidArgumentException("type '$type' tidak terdaftar di sistem");
        }
        if(in_array($id_bank_soal, ["","undefinied",null])){
            throw new InvalidArgumentException("bank soal '$id_bank_soal' tidak terdaftar di sistem");
        }
        
        $bankSoal = DB::table('v_bank_soal')->where('id', $id_bank_soal)->first();
        $targetList = json_decode($bankSoal?->target_list ?? '[]', true);
        $targetList = in_array("all",$targetList)? []:$targetList;

        $list = match($type){
            "fakultas"=>$bankSoal->createdBy=="fakultas" && count($targetList)>0?
                Fakultas::select(DB::raw('nama_fakultas as text'))
                    ->join("m_program_studi_simak", "m_program_studi_simak.kode_fak","=","m_fakultas_simak.kode_fakultas")
                    ->whereIn("m_program_studi_simak.kode_prodi",$targetList)
                    ->distinct()
                    ->get() : 
                Fakultas::select(DB::raw('nama_fakultas as text'))->distinct()->get(),
            "prodi"=>(
                $bankSoal->createdBy=="fakultas" && count($targetList)>0?  
                Prodi::select(
                    DB::raw('
                    concat(
                        `nama_prodi`, 
                        " (",
                        (
                        case 
                            when kode_jenjang = "C" then "S1"
                            when kode_jenjang = "B" then "S2"
                            when kode_jenjang = "A" then "S3"
                            when kode_jenjang = "E" then "D3"
                            when kode_jenjang = "D" then "D4"
                            when kode_jenjang = "J" then "Profesi"
                            else "?"
                        end
                        ),
                        ")"
                    ) as text')
                )->whereIn("kode_prodi", $targetList)->distinct()->get() : 
                Prodi::select(
                DB::raw('
                concat(
                    `nama_prodi`, 
                    " (",
                    (
                    case 
                        when kode_jenjang = "C" then "S1"
                        when kode_jenjang = "B" then "S2"
                        when kode_jenjang = "A" then "S3"
                        when kode_jenjang = "E" then "D3"
                        when kode_jenjang = "D" then "D4"
                        when kode_jenjang = "J" then "Profesi"
                        else "?"
                    end
                    ),
                    ")"
                ) as text')
            )->distinct()->get()
            ) ,
            "unit"=>Pengangkatan::select(DB::raw('unit_kerja as text'))->distinct()->get(),
            default=>collect([])
        };

        $labels = $list->pluck('text')->reduce(function($carry, $item) {
            if(!empty($item)){
                $carry[] = $item;
            }
            return $carry;
        }, []);

        ///

        $branchBankSoal = BankSoal::where("branch",$id_bank_soal)->first()?->id;
        $labels2 = [];

        if($branchBankSoal != null){
            $bankSoal = DB::table('v_bank_soal')->where('id', $branchBankSoal)->first();
            $targetList = json_decode($bankSoal?->target_list ?? '[]', true);
            $targetList = in_array("all",$targetList)? []:$targetList;

            $list = match($type){
                "fakultas"=>$bankSoal->createdBy=="fakultas" && count($targetList)>0?
                    Fakultas::select(DB::raw('nama_fakultas as text'))
                        ->join("m_program_studi_simak", "m_program_studi_simak.kode_fak","=","m_fakultas_simak.kode_fakultas")
                        ->whereIn("m_program_studi_simak.kode_prodi",$targetList)
                        ->distinct()
                        ->get() : 
                    Fakultas::select(DB::raw('nama_fakultas as text'))->distinct()->get(),
                "prodi"=>(
                    $bankSoal->createdBy=="fakultas" && count($targetList)>0?  
                    Prodi::select(
                        DB::raw('
                        concat(
                            `nama_prodi`, 
                            " (",
                            (
                            case 
                                when kode_jenjang = "C" then "S1"
                                when kode_jenjang = "B" then "S2"
                                when kode_jenjang = "A" then "S3"
                                when kode_jenjang = "E" then "D3"
                                when kode_jenjang = "D" then "D4"
                                when kode_jenjang = "J" then "Profesi"
                                else "?"
                            end
                            ),
                            ")"
                        ) as text')
                    )->whereIn("kode_prodi", $targetList)->distinct()->get() : 
                    Prodi::select(
                    DB::raw('
                    concat(
                        `nama_prodi`, 
                        " (",
                        (
                        case 
                            when kode_jenjang = "C" then "S1"
                            when kode_jenjang = "B" then "S2"
                            when kode_jenjang = "A" then "S3"
                            when kode_jenjang = "E" then "D3"
                            when kode_jenjang = "D" then "D4"
                            when kode_jenjang = "J" then "Profesi"
                            else "?"
                        end
                        ),
                        ")"
                    ) as text')
                )->distinct()->get()
                ) ,
                "unit"=>Pengangkatan::select(DB::raw('unit_kerja as text'))->distinct()->get(),
                default=>collect([])
            };

            $labels2 = $list->pluck('text')->reduce(function($carry, $item) {
                if(!empty($item)){
                    $carry[] = $item;
                }
                return $carry;
            }, []);
        }

        $labelsFinal = array_values(array_unique(array_merge($labels, $labels2)));

        return response()->json($labelsFinal);
    }

    // public function laporanV2($id_bank_soal, Request $request) {
    //     $target = $request?->target;
    //     $target_value = $request?->target_value;
    //     $branchBankSoal = BankSoal::where("branch", $id_bank_soal)->first()?->id;
    
    //     // 1️⃣ Ambil semua pertanyaan unik per teks
    //     $pertanyaanList = TemplatePertanyaan::with(['TemplatePilihan', 'Kategori', 'SubKategori'])
    //         ->whereIn('id_bank_soal', [$id_bank_soal, $branchBankSoal])
    //         ->get()
    //         ->groupBy('pertanyaan');
    
    //     // 2️⃣ Ambil semua jawaban terkait pertanyaan
    //     $allJawabanIds = TemplatePilihan::whereIn(
    //         'id_template_soal',
    //         $pertanyaanList->flatten()->pluck('id')->toArray()
    //     )->get();
    
    //     // 3️⃣ Hitung total per jawaban dan gabungkan template yang sama
    //     $jawabanCounts = collect();
    
    //     foreach ($pertanyaanList as $pertanyaanText => $pertGroup) {
    //         $detail = collect();
    
    //         // Ambil jawaban untuk semua template pertanyaan dengan teks yang sama
    //         $jawabanGroup = $allJawabanIds->whereIn('id_template_soal', $pertGroup->pluck('id'));
    
    //         // Gabungkan jawaban yang sama dari template berbeda
    //         foreach ($jawabanGroup->groupBy('jawaban') as $jawabanValue => $jawabanItems) {
    //             $total = Kuesioner::with(['tendik'])
    //                         ->join('kuesioner_jawaban as kj', 'kj.id_kuesioner', '=', 'kuesioner.id')
    //                         ->whereIn('kuesioner.id_bank_soal', [$id_bank_soal, $branchBankSoal])
    //                         ->whereIn('id_template_pertanyaan', $pertGroup->pluck('id')->toArray())
    //                         ->whereIn('id_template_jawaban', $jawabanItems->pluck('id')->toArray());
                            
    //             if (!empty($target_value)) {
    //                 $total = $total->where(function($query) use ($target_value) {
    //                     // Mahasiswa
    //                     $query->whereExists(function($sub) use ($target_value) {
    //                         $sub->select(DB::raw(1))
    //                             ->from('m_mahasiswa_simak')
    //                             ->join('m_program_studi','m_program_studi.kode_prodi','=','m_mahasiswa_simak.kode_prodi')
    //                             ->whereColumn('kuesioner.npm', 'm_mahasiswa_simak.NIM')
    //                             ->whereRaw("
    //                                 concat(
    //                                     m_program_studi.nama_prodi, 
    //                                     case 
    //                                         when m_program_studi.kode_jenjang='C' then ' (S1)' 
    //                                         when m_program_studi.kode_jenjang='B' then ' (S2)' 
    //                                         when m_program_studi.kode_jenjang='A' then ' (S3)' 
    //                                         when m_program_studi.kode_jenjang='E' then ' (D3)' 
    //                                         when m_program_studi.kode_jenjang='D' then ' (D4)' 
    //                                         when m_program_studi.kode_jenjang='J' then ' (Profesi)' 
    //                                         else '' 
    //                                     end
    //                                 ) = ?", [$target_value]);
    //                     })
    //                     // Dosen
    //                     ->orWhereExists(function($sub) use ($target_value) {
    //                         $sub->select(DB::raw(1))
    //                             ->from('m_dosen_simak')
    //                             ->join('m_program_studi','m_program_studi.kode_prodi','=','m_dosen_simak.kode_prodi')
    //                             ->whereColumn('kuesioner.nidn', 'm_dosen_simak.NIDN')
    //                             ->whereRaw("
    //                                 concat(
    //                                     m_program_studi.nama_prodi, 
    //                                     case 
    //                                         when m_program_studi.kode_jenjang='C' then ' (S1)' 
    //                                         when m_program_studi.kode_jenjang='B' then ' (S2)' 
    //                                         when m_program_studi.kode_jenjang='A' then ' (S3)' 
    //                                         when m_program_studi.kode_jenjang='E' then ' (D3)' 
    //                                         when m_program_studi.kode_jenjang='D' then ' (D4)' 
    //                                         when m_program_studi.kode_jenjang='J' then ' (Profesi)' 
    //                                         else '' 
    //                                     end
    //                                 ) = ?", [$target_value]);
    //                     })
    //                     // Tendik
    //                     ->orWhereHas('Tendik', function($q2) use ($target_value) {
    //                         $q2->where('unit', $target_value);
    //                     });;
    //                 });
    //             }

    //             $total = $total->count();

    //             $detail->push([
    //                 'jawaban' => $jawabanValue,
    //                 'id_template_jawaban' => $jawabanItems->pluck('id')->toArray(),
    //                 'total' => $total, // hitung per ID template jawaban
    //             ]);
    //         }
    
    //         // Siapkan chart
    //         $labels = $detail->pluck('jawaban')->toArray();
    //         $data = $detail->pluck('total')->toArray();
    //         $colors = $this->generateRandomColors(count($labels));
    
    //         $pertanyaanList[$pertanyaanText]->each(function ($pertanyaan) use ($detail, $labels, $data, $colors) {
    //             $pertanyaan->chart = [
    //                 'labels' => $labels,
    //                 'datasets' => [
    //                     [
    //                         'label' => $pertanyaan->jenis_pilihan == 'rating5' ? 'Dataset 1' : '# Total',
    //                         'data' => $data,
    //                         'backgroundColor' => $colors,
    //                         'borderColor' => $colors,
    //                         'borderWidth' => 1,
    //                     ],
    //                 ],
    //             ];
    
    //             $pertanyaan->TemplatePilihan = $detail; // update jawaban
    //         });
    
    //         $jawabanCounts[$pertanyaanText] = [
    //             'pertanyaan' => $pertanyaanText,
    //             'total' => $detail->sum('total'), // total semua jawaban
    //             'detail' => $detail,
    //         ];
    //     }
    
    //    // 4️⃣ Kelompokkan pertanyaan berdasarkan kategori dan subkategori
    //     $listPertanyaanGrouped = $pertanyaanList->flatten()->reduce(function($carry, $item) {
    //         $kategori = $item->Kategori?->nama_kategori ?? "unknown";
    //         $subKategori = $item->SubKategori?->nama_sub ?? "";
    //         $pattern = "$kategori#$subKategori";

    //         $carry[$pattern][] = [
    //             'pertanyaan' => $item->pertanyaan,
    //             'jenis_pilihan' => $item->jenis_pilihan,
    //             'chart' => $item->chart,
    //         ];

    //         return $carry;
    //     }, []);

    //     return response()->json($listPertanyaanGrouped);
    // }
    public function laporanV2($id_bank_soal, Request $request) {
        // Header SSE
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('X-Accel-Buffering: no'); // Untuk nginx / cloudflare

        // $id_bank_soal = "110";
        $target = $request?->target;
        $target_value = $request?->target_value;

        $branchBankSoal = BankSoal::where("branch", $id_bank_soal)->get()->pluck("id")->toArray();
        $targetBanksoal = array_merge($branchBankSoal, [$id_bank_soal]);

        // 1️⃣ Ambil semua pertanyaan unik
        $pertanyaanList = TemplatePertanyaan::with(['TemplatePilihan', 'Kategori', 'SubKategori'])
            ->whereIn('id_bank_soal', $targetBanksoal)
            ->get()
            ->groupBy('pertanyaan');

        // 2️⃣ Ambil template jawaban
        $allJawabanIds = TemplatePilihan::whereIn(
            'id_template_soal',
            $pertanyaanList->flatten()->pluck('id')->toArray()
        )->get();

        // Kirim jumlah pertanyaan dulu
        $this->sendSSE("start", [
            "total_pertanyaan" => count($pertanyaanList)
        ]);

        // 3️⃣ Loop seperti sebelumnya — per pertanyaan
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
                    ->whereIn('kuesioner.id_bank_soal', $targetBanksoal)
                    ->whereIn('id_template_pertanyaan', $pertGroup->pluck('id'))
                    ->whereIn('id_template_jawaban', $jawabanItems->pluck('id'));

                // Filtering
                if (!empty($target_value)) {
                    $total = $this->applyTargetFilter($total, $target_value);
                }

                $detail->push([
                    "jawaban" => empty($jawabanValue)? "Lainnya":$jawabanValue,
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
            $this->sendSSE("pertanyaan", [
                "pertanyaan" => $pertanyaanText,
                "kategori" => $pertGroup->first()->Kategori?->nama_kategori?? "unknown",
                "subKategori" => $pertGroup->first()->SubKategori?->nama_sub,
                "jenis_pilihan" => $pertGroup->first()->jenis_pilihan,
                "chart" => $charts,
            ]);
        }

        // 5️⃣ kirim selesai
        $this->sendSSE("done", ["message" => "completed"]);
        exit;
    }

    public function laporan(Request $request){
        $listFakultas = match($request->level){
            "admin"=>Fakultas::select('kode_fakultas','nama_fakultas')->get(),
            default=>collect([])
        };
        $listProdi = match($request->level){
            "admin"=>Prodi::select('kode_prodi','nama_prodi')->get(),
            "fakultas"=>Prodi::select('kode_prodi','nama_prodi')->get(),
            default=>collect(([])),
        };
        $listUnit = match($request->level){
            "admin"=>Pengangkatan::select('unit_kerja')->distinct()->get(),
            default=>collect([]),
        };
        $listAngkatan = match($request->level){
            "admin"=>Mahasiswa::where('tahun_masuk', '>=', 2010)
                        ->where('tahun_masuk', '!=', 2091)
                        ->distinct()
                        ->pluck('tahun_masuk'),
            "prodi"=>Mahasiswa::where('tahun_masuk', '>=', 2010)
                        ->where('tahun_masuk', '!=', 2091)
                        ->distinct()
                        ->pluck('tahun_masuk'),
            default=>collect([]),
        };

        $dynamicColumnFakultas = [];
        foreach ($listFakultas as $fakultas) {
            $dynamicColumnFakultas[] = DB::raw("SUM(CASE WHEN kuesioner.nidn is not null and m_dosen_simak.kode_fak = '$fakultas->kode_fakultas' THEN 1 ELSE 0 END) as 'fakultas_$fakultas->kode_fakultas'");
        }

        $dynamicColumnProdi = [];
        foreach ($listProdi as $prodi) {
            $dynamicColumnProdi[] = DB::raw("SUM(CASE WHEN kuesioner.nidn is not null and m_dosen_simak.kode_prodi = '$prodi->kode_prodi' THEN 1 ELSE 0 END) as 'prodi_$prodi->kode_prodi'");
        }

        $dynamicColumnUnit = [];
        foreach ($listUnit as $unit) {
            $dynamicColumnUnit[] = DB::raw("SUM(CASE WHEN kuesioner.nip is not null and n_pengangkatan_simpeg.unit_kerja = '$unit->unit_kerja' THEN 1 ELSE 0 END) as 'unit_$unit->unit_kerja'");
        }

        $dynamicColumnAngkatan = [];
        foreach ($listAngkatan as $angkatan) {
            $dynamicColumnAngkatan[] = DB::raw("SUM(CASE WHEN kuesioner.npm is not null and m_mahasiswa_simak.tahun_masuk = '$angkatan' THEN 1 ELSE 0 END) as 'mahasiswa_$angkatan'");
        }

        $allDynamicColumns = array_merge($dynamicColumnAngkatan, $dynamicColumnFakultas, $dynamicColumnProdi, $dynamicColumnUnit);

        $query = KuesionerJawaban::select(
                    DB::raw('MAX(kuesioner_jawaban.id) as id'),
                    DB::raw('MAX(kuesioner_jawaban.id_kuesioner) as id_kuesioner'),
                    DB::raw('MAX(kuesioner_jawaban.id_template_pertanyaan) as id_template_pertanyaan'),
                    DB::raw('MAX(kuesioner_jawaban.id_template_jawaban) as id_template_jawaban'),
                    DB::raw('MAX(kuesioner.nidn) as nidn'),
                    DB::raw('MAX(kuesioner.nip) as nip'),
                    DB::raw('MAX(kuesioner.npm) as npm'),
                    DB::raw('MAX(kuesioner.tanggal) as tanggal'),
                    DB::raw('MAX(template_pertanyaan.pertanyaan) as pertanyaan'),
                    DB::raw('MAX(template_pilihan.jawaban) as jawaban'),
                    DB::raw('MAX(template_pertanyaan.tipe) as tipe'),
                    DB::raw('MAX(tDosen.nama) as nama_dosen'),
                    DB::raw('MAX(m_dosen_simak.kode_prodi) as dosen_kode_prodi'),
                    DB::raw('MAX(m_dosen_simak.kode_fak) as dosen_kode_fakultas'),
                    DB::raw('MAX(n_pengangkatan_simpeg.unit_kerja) as unit_kerja'),
                    DB::raw('MAX(template_pertanyaan.bobot) as bobot'),
                    DB::raw('MAX(template_pilihan.nilai) as nilai'),
                    ...$allDynamicColumns,
                );
        if(!empty($request->start_date) && !empty($request->end_date)){
            $query= $query
                ->whereBetween('kuesioner.tanggal',[$request->start_date,$request->end_date]);
        }
        if(!empty($request->bankSoal)){
            $query = $query->where('kuesioner.id_bank_soal',$request->bankSoal);
        } else{
            return response()->json([
                'data' => [],
                'currentPage' => 0,
                'total' => 0,
                'lastPage' => 0,
            ]);
        }

        DB::statement("
            CREATE TEMPORARY TABLE temp_vtendik AS
            SELECT nip, nidn, MAX(nama) AS nama, MAX(fakultas) AS fakultas, MAX(unit) AS unit
            FROM (
                SELECT 
                    CASE WHEN e_pribadi_simpeg.nip = 0 THEN '' ELSE e_pribadi_simpeg.nip END AS nip,
                    e_pribadi_simpeg.nidn,
                    e_pribadi_simpeg.nama,
                    payroll_m_pegawai.fakultas,
                    NULL AS unit
                FROM e_pribadi_simpeg
                LEFT JOIN payroll_m_pegawai ON payroll_m_pegawai.nip = e_pribadi_simpeg.nip

                UNION ALL

                SELECT 
                    CASE WHEN n_pribadi_simpeg.nip = 0 THEN '' ELSE n_pribadi_simpeg.nip END AS nip,
                    NULL AS nidn,
                    n_pribadi_simpeg.nama,
                    NULL AS fakultas,
                    n_pengangkatan_simpeg.unit_kerja AS unit
                FROM n_pribadi_simpeg
                LEFT JOIN n_pengangkatan_simpeg ON n_pengangkatan_simpeg.nip = n_pribadi_simpeg.nip
            ) a
            GROUP BY a.nidn, a.nip
        ");

        $query= $query
                ->leftJoin('kuesioner', 'kuesioner_jawaban.id_kuesioner', '=', 'kuesioner.id')
                ->leftJoin('template_pertanyaan', 'kuesioner_jawaban.id_template_pertanyaan', '=', 'template_pertanyaan.id')
                ->leftJoin('template_pilihan', 'kuesioner_jawaban.id_template_jawaban', '=', 'template_pilihan.id')
                ->leftJoin(DB::raw('temp_vtendik as tDosen'), 'kuesioner.nidn', '=', 'tDosen.nidn')
                ->leftJoin('m_dosen_simak', 'm_dosen_simak.nidn', '=', 'tDosen.nidn')
                ->leftJoin(DB::raw('temp_vtendik as tTendik'), 'kuesioner.nip', '=', 'tTendik.nip')
                ->leftJoin('n_pengangkatan_simpeg', 'tTendik.nip', '=', 'n_pengangkatan_simpeg.nip')
                ->leftJoin('m_mahasiswa_simak', 'kuesioner.npm', '=', 'm_mahasiswa_simak.nim')
                ->groupBy(
                    'template_pertanyaan.pertanyaan', 
                    'template_pilihan.jawaban', 
                    'kuesioner.tanggal'
                )->paginate(5);

                return response()->json([
                    'data' => $query->items(),
                    'currentPage' => $query->currentPage(),
                    'total' => $query->total(),
                    'lastPage' => $query->lastPage(),
                ]);                
        
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
    function sendSSE($event, $data)
    {
        echo "event: $event\n";
        echo "data: " . json_encode($data) . "\n\n";
        @ob_flush();
        @flush();
    }
}
