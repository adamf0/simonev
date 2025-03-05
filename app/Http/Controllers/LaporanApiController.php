<?php

namespace App\Http\Controllers;

use App\Models\Dosen;
use App\Models\Fakultas;
use App\Models\Kuesioner;
use App\Models\KuesionerJawaban;
use App\Models\Mahasiswa;
use App\Models\Pengangkatan;
use App\Models\Prodi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LaporanApiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function rekap(Request $request)
    {
        $query = Kuesioner::select(
                                'kuesioner.id',
                                'kuesioner.nidn',
                                'kuesioner.nip',
                                'kuesioner.npm',
                                'kuesioner.id_bank_soal',
                                'kuesioner.tanggal',
                                'bank_soal.peruntukan',
                                DB::raw('bank_soal.judul as bankSoal'),
                                DB::raw('m_mahasiswa.nama_mahasiswa'),
                                DB::raw('m_mahasiswa.kode_fak as mahasiswa_kode_fakultas'),
                                DB::raw('m_mahasiswa.kode_prodi as mahasiswa_kode_prodi'),
                                DB::raw('tDosen.nama as nama_dosen'),
                                DB::raw('m_dosen.kode_prodi as dosen_kode_prodi'),
                                DB::raw('m_dosen.kode_fak as dosen_kode_fakultas'),
                                DB::raw('tTendik.nama as nama_tendik'),
                                'n_pengangkatan.unit_kerja'
                            )
                            ->join('bank_soal','kuesioner.id_bank_soal','=','bank_soal.id')
                            ->leftJoin(DB::raw('v_tendik as tDosen'),'kuesioner.nidn','=','tDosen.nidn')
                            ->leftJoin('m_dosen','m_dosen.nidn','=','tDosen.nidn')
                            
                            ->leftJoin(DB::raw('v_tendik as tTendik'),'kuesioner.nip','=','tTendik.nip')
                            ->leftJoin('n_pengangkatan','tTendik.nip','=','n_pengangkatan.nip')
                            ->leftJoin('m_mahasiswa','kuesioner.npm','=','m_mahasiswa.nim');

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
            $query = $query->where('kuesioner.id_bank_soal',$request->bankSoal);
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
            $query = $query->whereNotNull('kuesioner.npm');
        }
        
        $kuesioner = $query->paginate(5);

        $kuesioner->getCollection()->transform(function($item) {
            if($item->Dosen!=null){
                $dosen = Dosen::select('kode_fak','kode_prodi')->where('nidn',$item->nidn)->first();
                $item->Dosen->kode_fakultas = $dosen->kode_fak;
                $item->Dosen->kode_prodi = $dosen->kode_prodi;
            }
            return $item;
        });

        return response()->json([
            'data' => $kuesioner->getCollection(),
            'currentPage' => $kuesioner->currentPage(),
            'total' => $kuesioner->total(),
            'lastPage' => $kuesioner->lastPage(),
        ]);
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
