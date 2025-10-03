<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\Dosen;
use App\Models\DosenTendik;
use App\Models\Fakultas;
use App\Models\KuesionerJawaban;
use App\Models\Mahasiswa;
use App\Models\Pengangkatan;
use App\Models\Prodi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class LaporanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function rekap()
    {
        $level = session()->get('level');
        $fakultas = session()->get('fakultas');
        $prodi = session()->get('prodi');
        
        $listUnit = Pengangkatan::select('unit_kerja', DB::raw('rtrim(REPLACE(unit_kerja, "F.", "Fakultas")) as text'))->distinct()->get()->filter(fn($item)=>!empty($item->text))->values();
        $listMahasiswa = Mahasiswa::select('nim','nama_mahasiswa','kode_fak','kode_prodi')->get();
        $listDosen = Dosen::get();
        $listTendik = DosenTendik::select('v_tendik.*','n_pengangkatan_simpeg.unit_kerja')
                        ->join('n_pengangkatan_simpeg','v_tendik.nip','=','n_pengangkatan_simpeg.nip')
                        ->whereNotNull('v_tendik.nip')
                        ->get();
        $listFakultas = Fakultas::select('kode_fakultas', 'nama_fakultas')
                            ->with('Prodis')
                            ->get()
                            ->transform(function($item) {
                                $prodis = $item->prodis->map(fn($p) => [
                                    "id" => $p->kode_prodi,
                                    "kode_fak" => $p->kode_fak,
                                    "text" => $p->nama_prodi
                                ]);

                                return [
                                    "id" => $item->kode_fakultas,
                                    "text" => $item->nama_fakultas,
                                    "prodis" => $prodis
                                ];
                            });
        
        $listBankSoal = DB::table('v_bank_soal as bs')
                            ->select(
                                'bs.id',
                                DB::raw('bs.judul as text'),
                                'bs.createdBy',
                                'bs.target_type',
                                'bs.target_list',
                                'bs.peruntukan',
                                DB::raw("
                                    CASE 
                                        WHEN bs.target_type = 'prodi' THEN (
                                            CASE 
                                                WHEN JSON_CONTAINS(bs.target_list, '\"all\"') THEN 
                                                    (SELECT GROUP_CONCAT(p.nama_prodi SEPARATOR ', ') 
                                                     FROM m_program_studi_simak p)
                                                ELSE
                                                    (SELECT GROUP_CONCAT(p.nama_prodi SEPARATOR ', ')
                                                     FROM JSON_TABLE(bs.target_list, '$[*]' 
                                                         COLUMNS (kode_prodi VARCHAR(10) PATH '$')
                                                     ) jt
                                                     JOIN m_program_studi_simak p 
                                                         ON p.kode_prodi = jt.kode_prodi)
                                            END
                                        )
                                        WHEN bs.target_type = 'unit' THEN (
                                            CASE 
                                                WHEN JSON_CONTAINS(bs.target_list, '\"all\"') THEN 
                                                    (SELECT GROUP_CONCAT(
                                                                RTRIM(REPLACE(u.unit_kerja, 'F.', 'Fakultas')) 
                                                                SEPARATOR ', '
                                                            )
                                                     FROM n_pengangkatan_simpeg u)
                                                ELSE
                                                    (SELECT GROUP_CONCAT(
                                                                RTRIM(REPLACE(u.unit_kerja, 'F.', 'Fakultas')) 
                                                                SEPARATOR ', '
                                                            )
                                                     FROM JSON_TABLE(bs.target_list, '$[*]' 
                                                         COLUMNS (kode_unit VARCHAR(255) PATH '$')
                                                     ) jt
                                                     JOIN n_pengangkatan_simpeg u 
                                                         ON u.unit_kerja = jt.kode_unit)
                                            END
                                        )
                                        ELSE NULL
                                    END AS target_list_name
                                ")
                            );

        if($level=="fakultas"){
            $listTarget = Prodi::where('kode_fak', $fakultas)->pluck('kode_prodi');

            $listBankSoal = $listBankSoal
                                ->where("createdBy", "fakultas")
                                ->where(function($q) use ($listTarget) {
                                    foreach ($listTarget as $kode) {
                                        $q->orWhereRaw('JSON_CONTAINS(target_list, ?)', [json_encode($kode)]);
                                    }
                                });
        }
        $listBankSoal = $listBankSoal->get()->map(function($row){
            if($row->createdBy=="fakultas"){
                $targetList = json_decode($row?->target_list ?? '[]', true);
                $targetList = in_array("all",$targetList)? []:$targetList;
                $listFakultas = Fakultas::select(DB::raw('nama_fakultas as text'))
                        ->join("m_program_studi_simak", "m_program_studi_simak.kode_fak","=","m_fakultas_simak.kode_fakultas")
                        ->whereIn("m_program_studi_simak.kode_prodi",$targetList)
                        ->distinct()
                        ->get()
                        ->pluck("text")
                        ->toArray();
    
                $row->text = count($targetList)? ("[".implode(",",$listFakultas)."] ".$row->text):$row->text;
            } else{
                $row->text = "[LPM] ".$row->text;
            }

            return $row;
        });

        return Inertia::render('Laporan/Rekap', [
            'kode_fakultas'=>session()->get('level')=="fakultas"? session()->get('fakultas'):null, 
            "listMahasiswa"=>$listMahasiswa,
            "listDosen"=>$listDosen,
            "listTendik"=>$listTendik,
            "listFakultas"=>$listFakultas,
            "listUnit"=>$listUnit,
            "listBankSoal"=>$listBankSoal,
            "level"=>session()->get('level')
        ]);
    }

    public function laporan(){
        $level = session()->get('level');
        $fakultas = session()->get('fakultas');
        $prodi = session()->get('prodi');

        $listFakultas = match($level){
            "admin"=>Fakultas::select('kode_fakultas','nama_fakultas')->get(),
            default=>collect([]),
        };
        $listProdi = match($level){
            "admin"=>Prodi::select('kode_prodi','nama_prodi')->get(),
            "fakultas"=>Prodi::select('kode_prodi','nama_prodi')->where('kode_fak',$fakultas)->get(),
            default=>collect([]),
        };
        $listUnit = match($level){
            "admin"=>Pengangkatan::select('unit_kerja', DB::raw('rtrim(REPLACE(unit_kerja, "F.", "Fakultas")) as text'))->distinct()->get(),
            default=>collect([]),
        };
        $listAngkatan = match($level){
            "admin"=>Mahasiswa::where('tahun_masuk', '>=', 2010)
                            ->where('tahun_masuk', '!=', 2091)
                            ->distinct()
                            ->pluck('tahun_masuk'),
            "prodi"=>Mahasiswa::where('tahun_masuk', '>=', 2010)
                            ->where('tahun_masuk', '!=', 2091)
                            ->where('kode_prodi',$prodi)
                            ->distinct()
                            ->pluck('tahun_masuk'),
            default=>collect([]),
        };
        $listBankSoal = DB::table('v_bank_soal as bs')
        ->select(
            'bs.id',
            DB::raw('bs.judul as text'),
            'bs.createdBy',
            'bs.target_type',
            'bs.target_list',
            'bs.peruntukan',
            DB::raw("
                CASE 
                    WHEN bs.target_type = 'prodi' THEN (
                        CASE 
                            WHEN JSON_CONTAINS(bs.target_list, '\"all\"') THEN 
                                (SELECT GROUP_CONCAT(
                                    concat(
                                        p.nama_prodi,
                                        case 
                                            when kode_jenjang = 'C' then ' (S1)'
                                            when kode_jenjang = 'B' then ' (S2)'
                                            when kode_jenjang = 'A' then ' (S3)'
                                            when kode_jenjang = 'E' then ' (D3)'
                                            when kode_jenjang = 'D' then ' (D4)'
                                            when kode_jenjang = 'J' then ' (Profesi)'
                                            else '(x)'
                                        end
                                    ) SEPARATOR ', ') 
                                 FROM m_program_studi_simak p)
                            ELSE
                                (SELECT GROUP_CONCAT(concat(
                                        p.nama_prodi,
                                        case 
                                            when kode_jenjang = 'C' then ' (S1)'
                                            when kode_jenjang = 'B' then ' (S2)'
                                            when kode_jenjang = 'A' then ' (S3)'
                                            when kode_jenjang = 'E' then ' (D3)'
                                            when kode_jenjang = 'D' then ' (D4)'
                                            when kode_jenjang = 'J' then ' (Profesi)'
                                            else '(x)'
                                        end
                                    ) SEPARATOR ', ')
                                 FROM JSON_TABLE(bs.target_list, '$[*]' 
                                     COLUMNS (kode_prodi VARCHAR(10) PATH '$')
                                 ) jt
                                 JOIN m_program_studi_simak p 
                                     ON p.kode_prodi = jt.kode_prodi)
                        END
                    )
                    WHEN bs.target_type = 'unit' THEN (
                        CASE 
                            WHEN JSON_CONTAINS(bs.target_list, '\"all\"') THEN 
                                (SELECT GROUP_CONCAT(
                                            RTRIM(REPLACE(u.unit_kerja, 'F.', 'Fakultas')) 
                                            SEPARATOR ', '
                                        )
                                 FROM n_pengangkatan_simpeg u)
                            ELSE
                                (SELECT GROUP_CONCAT(
                                            RTRIM(REPLACE(u.unit_kerja, 'F.', 'Fakultas')) 
                                            SEPARATOR ', '
                                        )
                                 FROM JSON_TABLE(bs.target_list, '$[*]' 
                                     COLUMNS (kode_unit VARCHAR(255) PATH '$')
                                 ) jt
                                 JOIN n_pengangkatan_simpeg u 
                                     ON u.unit_kerja = jt.kode_unit)
                        END
                    )
                    ELSE NULL
                END AS target_list_name
            ")
        );

        if($level=="fakultas"){
            $listTarget = Prodi::where('kode_fak', $fakultas)->pluck('kode_prodi');

            $listBankSoal = $listBankSoal
                                ->where("createdBy", "fakultas")
                                ->where(function($q) use ($listTarget) {
                                    foreach ($listTarget as $kode) {
                                        $q->orWhereRaw('JSON_CONTAINS(target_list, ?)', [json_encode($kode)]);
                                    }
                                });
        }
        $listBankSoal = $listBankSoal->get()->map(function($row){
            $row->target_list_name = empty($row->target_list) 
                                        ? [] 
                                        : array_map('trim', explode(',', $row->target_list_name));

            if($row->createdBy=="fakultas"){
                $targetList = json_decode($row?->target_list ?? '[]', true);
                $targetList = in_array("all",$targetList)? []:$targetList;
                $listFakultas = Fakultas::select(DB::raw('nama_fakultas as text'))
                        ->join("m_program_studi_simak", "m_program_studi_simak.kode_fak","=","m_fakultas_simak.kode_fakultas")
                        ->whereIn("m_program_studi_simak.kode_prodi",$targetList)
                        ->distinct()
                        ->get()
                        ->pluck("text")
                        ->toArray();
    
                $row->text = count($targetList)? ("[".implode(",",$listFakultas)."] ".$row->text):$row->text;
                return $row;
            }
            
            $row->text = "[LPM] ".$row->text;

            return $row;
        });

        return Inertia::render('Laporan/Laporan',[
            "level"=>$level,
            "listFakultas"=>$listFakultas,
            "listProdi"=>$listProdi,
            "listUnit"=>$listUnit,
            "listAngkatan"=>$listAngkatan,
            "listBankSoal"=>$listBankSoal
        ]);
    }
}
