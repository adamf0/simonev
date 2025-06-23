<?php

namespace App\Http\Controllers;

use App\Models\AkunSimak;
use App\Models\BankSoal;
use App\Models\Fakultas;
use App\Models\KuesionerJawaban;
use App\Models\Pengangkatan;
use App\Models\Prodi;
use App\Models\TemplatePertanyaan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BankSoalController extends Controller
{
    // function __construct()
    // {
    //     parent::__construct();
    // }

    public function bankSoal(Request $request)
    {
        $prodi = Prodi::select(DB::raw("kode_prodi as id"),DB::raw("nama_prodi as nama"))->where('kode_fak',session()->get('fakultas'))->get();
        $mahasiswa = collect([]); //AkunSimak::select(DB::raw("userid as id"), "nama")->where("level","MAHASISWA")->get()
        $unit = Pengangkatan::select('unit_kerja')->distinct()->whereNot("unit_kerja","")->get();
        
        $listTarget = array_values(array_unique([
            session()->get("fakultas"),
            session()->get("prodi"),
            session()->get("unit")
        ]));
        if($request->get("debug")){
            dd([
                session()->get("fakultas"),
                $prodi->pluck("id")->toArray(),
                session()->get("unit")
            ]);
        }

        return Inertia::render('BankSoal/BankSoal', ["listTarget"=> $listTarget, "level"=>session()->get('level'), "listUnit"=>$unit, "listProdi"=>$prodi, "listMahahsiswa"=>$mahasiswa,]);
    }

    public function bankSoalEdit($id_bank_soal)
    {
        $data = BankSoal::find($id_bank_soal);
        $fakultas = Fakultas::select(DB::raw("kode_fakultas as id"),DB::raw("nama_fakultas as nama"))->get();
        $prodi = Prodi::select(DB::raw("kode_prodi as id"),DB::raw("nama_prodi as nama"))->get();
        $mahasiswa = collect([]); //AkunSimak::select(DB::raw("userid as id"), "nama")->where("level","MAHASISWA")->get()
        $unit = Pengangkatan::select('unit_kerja')->distinct()->get();

        return Inertia::render('BankSoal/BankSoalForm', ['typeEvent' => "Edit", "dataBankSoal"=>$data, "listUnit"=>$unit, "listFakultas"=>$fakultas, "listProdi"=>$prodi, "listMahahsiswa"=>$mahasiswa, "level"=>session()->get('level')]);
    }

    public function bankSoalPreview($id_bank_soal)
    {
        $bankSoal = BankSoal::findOrFail($id_bank_soal);
        $pertanyaan = TemplatePertanyaan::with(['Kategori','SubKategori','TemplatePilihan'])->where('id_bank_soal',$id_bank_soal)->get();
        $pertanyaan = $pertanyaan->map(function($item){
            $freeText = $item->TemplatePilihan->where('isFreeText',1)->count();

            $item->freeText = $freeText>0;
            $item->pattern = $item->Kategori?->nama_kategori."||".$item->SubKategori?->nama_sub;
            unset($item->Kategori);
            unset($item->SubKategori);

            return $item;
        });
        $groupPertanyaan = $pertanyaan->groupBy("pattern");

        return Inertia::render('BankSoal/BankSoalPreview', ['bankSoal'=>$bankSoal, 'groupPertanyaan'=>$groupPertanyaan, "level"=>session()->get('level')]);
    }
}
