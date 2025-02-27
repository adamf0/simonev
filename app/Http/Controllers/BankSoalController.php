<?php

namespace App\Http\Controllers;

use App\Models\AkunSimak;
use App\Models\BankSoal;
use App\Models\Fakultas;
use App\Models\Pengangkatan;
use App\Models\Prodi;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BankSoalController extends Controller
{
    // function __construct()
    // {
    //     parent::__construct();
    // }

    public function bankSoal()
    {
        return Inertia::render('BankSoal/BankSoal', ["level"=>session()->get('level')]);
    }

    public function bankSoalEdit($id_bank_soal)
    {
        try {
            $data = BankSoal::find($id_bank_soal);
        $fakultas = Fakultas::select(DB::raw("kode_fakultas as id"),DB::raw("nama_fakultas as nama"))->get();
        $prodi = Prodi::select(DB::raw("kode_prodi as id"),DB::raw("nama_prodi as nama"))->get();
        $mahasiswa = AkunSimak::select(DB::raw("userid as id"), "nama")->where("level","MAHASISWA")->get();
        $unit = Pengangkatan::select('unit_kerja')->distinct()->get();

        return Inertia::render('BankSoal/BankSoalForm', ['typeEvent' => "Edit", "dataBankSoal"=>$data, "listUnit"=>$unit, "listFakultas"=>$fakultas, "listProdi"=>$prodi, "listMahahsiswa"=>$mahasiswa, "level"=>session()->get('level')]);
        } catch (\Throwable $th) {
            throw $th;
        }
    }
}
