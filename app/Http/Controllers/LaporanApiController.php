<?php

namespace App\Http\Controllers;

use App\Models\Dosen;
use App\Models\Fakultas;
use App\Models\Kuesioner;
use App\Models\KuesionerJawaban;
use App\Models\Mahasiswa;
use App\Models\Pengangkatan;
use App\Models\Prodi;
use App\Models\TemplatePertanyaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use InvalidArgumentException;

class LaporanApiController extends Controller
{
    private function generateRandomColors($count){
        $colors = [];
        
        while (count($colors) < $count) {
            // Generate random RGB values
            $r = rand(50, 255);  // Avoid 0 (black) and ensure enough color range
            $g = rand(50, 255);  // Avoid 0 (black) and ensure enough color range
            $b = rand(50, 255);  // Avoid 0 (black) and ensure enough color range
            
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
        $query = DB::table("v_entry")
                    ->select(
                        'v_entry.id',
                        'v_entry.nidn',
                        'v_entry.nip',
                        'v_entry.npm',
                        'v_entry.id_bank_soal',
                        'v_entry.tanggal',
                        'bank_soal.peruntukan',
                        'bank_soal.judul as bankSoal',
                        'm_mahasiswa.nama_mahasiswa',
                        'm_mahasiswa.kode_fak as mahasiswa_kode_fakultas',
                        'm_mahasiswa.kode_prodi as mahasiswa_kode_prodi',
                        'tDosen.nama as nama_dosen',
                        'm_dosen.kode_prodi as dosen_kode_prodi',
                        'm_dosen.kode_fak as dosen_kode_fakultas',
                        'tTendik.nama as nama_tendik',
                        'n_pengangkatan.unit_kerja',
                        'v_entry.total_required',
                        'v_entry.total_required_filled'
                    )
                    ->join('bank_soal', 'v_entry.id_bank_soal', '=', 'bank_soal.id')
                    ->leftJoin(
                        DB::raw('(SELECT nidn, nama FROM v_tendik) as tDosen'),
                        'v_entry.nidn',
                        '=',
                        'tDosen.nidn'
                    )
                    ->leftJoin(
                        DB::raw('(SELECT nidn, kode_fak, kode_prodi FROM m_dosen) as m_dosen'),
                        'm_dosen.nidn',
                        '=',
                        'tDosen.nidn'
                    )
                    ->leftJoin(
                        DB::raw('(SELECT nip, nama FROM v_tendik) as tTendik'),
                        'v_entry.nip',
                        '=',
                        'tTendik.nip'
                    )
                    ->leftJoin(
                        DB::raw('(SELECT nip, unit_kerja FROM n_pengangkatan) as n_pengangkatan'),
                        'tTendik.nip',
                        '=',
                        'n_pengangkatan.nip'
                    )
                    ->leftJoin(
                        DB::raw('(SELECT nim, nama_mahasiswa, kode_fak, kode_prodi FROM m_mahasiswa) as m_mahasiswa'),
                        'v_entry.npm',
                        '=',
                        'm_mahasiswa.nim'
                    )
                    ->where('v_entry.total_required','<=',DB::raw('v_entry.total_required_filled'));

        if($request->start_date && $request->end_date){
            $query = $query->whereBetween('tanggal',[$request->start_date, $request->end_date]);
        }
        if($request->level=="fakultas" || !empty($request->fakultas)){
            $query = $query->where('m_mahasiswa.kode_fak', $request->fakultas);
        }
        if($request->level=="prodi" || !empty($request->prodi)){
            $query = $query->where('m_mahasiswa.kode_prodi', $request->prodi);
        }
        if(!empty($request->npm)){
            $query = $query->where('npm',$request->npm);
        }
        if(!empty($request->bankSoal)){
            $query = $query->where('v_entry.id_bank_soal',$request->bankSoal);
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
                $query = $query->where('n_pengangkatan.unit_kerja',$request->unit);
            }
        } else if($request->level=="prodi" || $request->level=="fakultas"){
            $query = $query->whereNotNull('v_entry.npm');
        }
        
        $totalRecords = $query->get()->count();
        $kuesioner = $query->paginate(5);

        // $kuesioner->getCollection()->transform(function($item) {
        //     if (!empty($item->nidn)) {
        //         $dosen = Dosen::select('kode_fak','kode_prodi')->where('nidn',$item->nidn)->first();
        //         $item->Dosen->kode_fakultas = $dosen->kode_fak;
        //         $item->Dosen->kode_prodi = $dosen->kode_prodi;
        //     }
        //     return $item;
        // });

        return response()->json([
            'data' => $kuesioner->getCollection(),
            'currentPage' => $kuesioner->currentPage(),
            'total' => $totalRecords,
            'lastPage' => $kuesioner->lastPage(),
        ]);
    }

    public function chart($id_bank_soal, $type){
        if(!in_array($type, ["fakultas","prodi","unit"])){
            throw new InvalidArgumentException("type '$type' tidak terdaftar di sistem");
        }
        if(in_array($id_bank_soal, ["","undefinied",null])){
            throw new InvalidArgumentException("bank soal '$id_bank_soal' tidak terdaftar di sistem");
        }

        $list = match($type){
            "fakultas"=>Fakultas::select(DB::raw('nama_fakultas as text'))->distinct()->get(),
            "prodi"=>Prodi::select(
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
            )->distinct()->get(),
            "unit"=>Pengangkatan::select(DB::raw('unit_kerja as text'))->distinct()->get(),
            default=>collect([])
        };

        $labels = $list->pluck('text')->reduce(function($carry, $item) {
            if(!empty($item)){
                $carry[] = $item;
            }
            return $carry;
        }, []);

        $dataset = [];
        $totalCount = 0;
        foreach($labels as $l){
            $entry = DB::table('v_entry')
                ->where($type=="prodi"? "prodi_jenjang":$type, $l)
                ->where('id_bank_soal',$id_bank_soal)
                ->where('total_required_filled',">",0)
                ->where('total_required','<=',DB::raw('total_required_filled'));

            $count = $entry->count();
            $dataset[] = $count;
            $totalCount += $count;
        }

        $percentages = array_map(function($count) use ($totalCount) {
            return $totalCount > 0 ? round(($count / $totalCount) * 100, 2) : 0;
        }, $dataset);
        
        $colors = $this->generateRandomColors(count($labels));
        return json_encode([
            "labels"=> $labels,
            "datasets"=> [
              [
                "label"=> '# Total',
                "data"=> $dataset,
                "backgroundColor"=> $colors,
                "borderColor"=> $colors,
                "borderWidth"=> 1,
              ],
            ],
        ]);
    }

    public function laporanV2($id_bank_soal){
        $listPertanyaan = TemplatePertanyaan::with(['TemplatePilihan','Kategori','SubKategori'])
                            ->where('id_bank_soal',$id_bank_soal)
                            ->get()
                            ->map(function($pertanyaan) use(&$id_bank_soal){
                                $pertanyaan->TemplatePilihan->map(function($jawaban) use(&$pertanyaan, &$id_bank_soal){
                                    $results = Kuesioner::join('kuesioner_jawaban as kj', 'kj.id_kuesioner', '=', 'kuesioner.id')
                                                ->where('kuesioner.id_bank_soal', $id_bank_soal)
                                                ->where('id_template_pertanyaan',$pertanyaan->id)
                                                ->where('id_template_jawaban',$jawaban->id)
                                                ->count();
                                                
                                    $jawaban->jawaban = $jawaban->isFreeText? "Lainnya":$jawaban->jawaban;
                                    $jawaban->total = $results;
                                });

                                $labels = $pertanyaan->TemplatePilihan->pluck('jawaban')->toArray();
                                $data = $pertanyaan->TemplatePilihan->pluck('total')->toArray();

                                if($pertanyaan->jenis_pilihan=="rating5"){
                                    $colors = $this->generateRandomColors(count($labels)); // Generating random colors for each label
                                    $pertanyaan->chart = [
                                        "labels" => $labels,
                                        "datasets" => [
                                            [
                                                "label" => 'Dataset 1',
                                                "data" => $data,
                                                "backgroundColor" => $colors,
                                            ],
                                        ],
                                    ];
                                } else{
                                    $colors = $this->generateRandomColors(count($labels)); // Generating random colors for each label
                                    $pertanyaan->chart = [
                                        "labels"=> $labels,
                                        "datasets"=> [
                                          [
                                            "label"=> '# Total',
                                            "data"=> $data,
                                            "backgroundColor"=> $colors,
                                            "borderColor"=> $colors,
                                            "borderWidth"=> 1,
                                          ],
                                        ],
                                    ];
                                }
                                return $pertanyaan;
                            })
                            ->reduce(function($carry, $item) {
                                $kategori = $item->Kategori?->nama_kategori ?? "unknown";
                                $sub_kategori = $item->SubKategori?->nama_sub ?? "";
                                $pattern = "$kategori#$sub_kategori";

                                $carry[$pattern][] = [
                                    "pertanyaan"=>$item->pertanyaan,
                                    "jenis_pilihan"=>$item->jenis_pilihan,
                                    "chart"=>$item->chart,
                                ];

                                return $carry;
                            }, []);

        return json_encode($listPertanyaan);
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
            $dynamicColumnFakultas[] = DB::raw("SUM(CASE WHEN kuesioner.nidn is not null and m_dosen.kode_fak = '$fakultas->kode_fakultas' THEN 1 ELSE 0 END) as 'fakultas_$fakultas->kode_fakultas'");
        }

        $dynamicColumnProdi = [];
        foreach ($listProdi as $prodi) {
            $dynamicColumnProdi[] = DB::raw("SUM(CASE WHEN kuesioner.nidn is not null and m_dosen.kode_prodi = '$prodi->kode_prodi' THEN 1 ELSE 0 END) as 'prodi_$prodi->kode_prodi'");
        }

        $dynamicColumnUnit = [];
        foreach ($listUnit as $unit) {
            $dynamicColumnUnit[] = DB::raw("SUM(CASE WHEN kuesioner.nip is not null and n_pengangkatan.unit_kerja = '$unit->unit_kerja' THEN 1 ELSE 0 END) as 'unit_$unit->unit_kerja'");
        }

        $dynamicColumnAngkatan = [];
        foreach ($listAngkatan as $angkatan) {
            $dynamicColumnAngkatan[] = DB::raw("SUM(CASE WHEN kuesioner.npm is not null and m_mahasiswa.tahun_masuk = '$angkatan' THEN 1 ELSE 0 END) as 'mahasiswa_$angkatan'");
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
                    DB::raw('MAX(m_dosen.kode_prodi) as dosen_kode_prodi'),
                    DB::raw('MAX(m_dosen.kode_fak) as dosen_kode_fakultas'),
                    DB::raw('MAX(n_pengangkatan.unit_kerja) as unit_kerja'),
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

        $query= $query
                ->leftJoin('kuesioner', 'kuesioner_jawaban.id_kuesioner', '=', 'kuesioner.id')
                ->leftJoin('template_pertanyaan', 'kuesioner_jawaban.id_template_pertanyaan', '=', 'template_pertanyaan.id')
                ->leftJoin('template_pilihan', 'kuesioner_jawaban.id_template_jawaban', '=', 'template_pilihan.id')
                ->leftJoin(DB::raw('v_tendik as tDosen'), 'kuesioner.nidn', '=', 'tDosen.nidn')
                ->leftJoin('m_dosen', 'm_dosen.nidn', '=', 'tDosen.nidn')
                ->leftJoin(DB::raw('v_tendik as tTendik'), 'kuesioner.nip', '=', 'tTendik.nip')
                ->leftJoin('n_pengangkatan', 'tTendik.nip', '=', 'n_pengangkatan.nip')
                ->leftJoin('m_mahasiswa', 'kuesioner.npm', '=', 'm_mahasiswa.nim')
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
}
