<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
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
        $listUnit = Pengangkatan::select('unit_kerja', DB::raw('rtrim(REPLACE(unit_kerja, "F.", "Fakultas")) as text'))->distinct()->get()->filter(fn($item)=>!empty($item->text))->values();
        $listMahasiswa = Mahasiswa::select('nim','nama_mahasiswa','kode_fak','kode_prodi')->get();
        $listDosen = DosenTendik::whereNotNull('nidn')->get();
        $listTendik = DosenTendik::select('v_tendik.*','n_pengangkatan.unit_kerja')
                        ->join('n_pengangkatan','v_tendik.nip','=','n_pengangkatan.nip')
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
        $listBankSoal = BankSoal::select('id',DB::raw('judul as text'))->get();

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
        $listBankSoal = DB::table('v_bank_soal')->select('id',DB::raw('judul as text'), 'target_list', 'peruntukan');
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
            $targetList = json_decode($row?->target_list ?? '[]', true);
            $targetList = in_array("all",$targetList)? []:$targetList;
            $listFakultas = Fakultas::select(DB::raw('nama_fakultas as text'))
                    ->join("m_program_studi", "m_program_studi.kode_fak","=","m_fakultas.kode_fakultas")
                    ->whereIn("m_program_studi.kode_prodi",$targetList)
                    ->distinct()
                    ->get()
                    ->pluck("text")
                    ->toArray();

            $row->text = count($targetList) && $row->createdBy=="fakultas"? ("[".implode(",",$listFakultas)."] ".$row->text):$row->text;

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
