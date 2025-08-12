<?php

namespace App\Http\Controllers;

use App\Models\Prodi;
use App\Models\VKuesioner;
use Illuminate\Support\Facades\DB;

class TesController extends Controller
{
    function index() {
        $id_bank_soal = 110;
        $type = "prodi";

        $bankSoal = DB::table('v_bank_soal')->where('id', $id_bank_soal)->first();
        $targetList = json_decode($bankSoal?->target_list ?? '[]', true);
        $targetList = in_array("all",$targetList)? []:$targetList;
        
        $list = $bankSoal->createdBy=="fakultas" && count($targetList)>0?  
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
            )->distinct()->get();

        $dataset = [];
        $labels = $list->pluck('text')->reduce(function($carry, $item) {
            if(!empty($item)){
                $carry[] = $item;
            }
            return $carry;
        }, []);

        $allData = VKuesioner::with([
                'Mahasiswa'=>fn($q)=>$q->select("kode_fak","kode_prodi","NIM","nama_mahasiswa"),
                'Mahasiswa.Fakultas'=>fn($q)=>$q->select("kode_fakultas","nama_fakultas"),
                'Mahasiswa.Prodi'=>fn($q)=>$q->select("kode_prodi",DB::raw('(
                    concat(
                        nama_prodi,
                        case 
                            when kode_jenjang = "C" then " (S1)"
                            when kode_jenjang = "B" then " (S2)"
                            when kode_jenjang = "A" then " (S3)"
                            when kode_jenjang = "E" then " (D3)"
                            when kode_jenjang = "D" then " (D4)"
                            when kode_jenjang = "J" then " (Profesi)"
                            else "?"
                        end
                    )    
                ) as nama_prodi_jenjang'), "nama_prodi"),
                'Dosen'=>fn($q)=>$q->select("kode_fak","kode_prodi","NIDN","nama_dosen"),
                'Dosen.Fakultas'=>fn($q)=>$q->select("kode_fakultas","nama_fakultas"),
                'Dosen.Prodi'=>fn($q)=>$q->select("kode_prodi",DB::raw('(
                    concat(
                        nama_prodi,
                        case 
                            when kode_jenjang = "C" then " (S1)"
                            when kode_jenjang = "B" then " (S2)"
                            when kode_jenjang = "A" then " (S3)"
                            when kode_jenjang = "E" then " (D3)"
                            when kode_jenjang = "D" then " (D4)"
                            when kode_jenjang = "J" then " (Profesi)"
                            else "?"
                        end
                    )    
                ) as nama_prodi_jenjang'), "nama_prodi"),
                'Tendik',
            ])
            ->where("id_bank_soal",$id_bank_soal)
            ->get();
        
        foreach($labels as $l){
            $count = $allData->filter(function ($item) use ($l) {
                $dosenProdi = optional(optional($item->Dosen)->Prodi)->nama_prodi_jenjang;
                $mhsProdi   = optional(optional($item->Mahasiswa)->Prodi)->nama_prodi_jenjang;
                return $dosenProdi === $l || $mhsProdi === $l;
            })->count();
            $dataset[] = $count;
        }
        
        return response()->json($allData);
    }
}
