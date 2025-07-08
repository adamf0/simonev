<?php

namespace App\Http\Controllers;

use App\Models\Fakultas;
use App\Models\Kategori;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KategoriController extends Controller
{
    // function __construct()
    // {
    //     parent::__construct();
    // }

    public function Kategori()
    {
        $fakultas = Fakultas::where("kode_fakultas",session()->get('fakultas'))->first();
        return Inertia::render('Kategori/Kategori', ["level"=>session()->get('level'),"fakultas"=>$fakultas?->nama_fakultas]);
    }

    public function KategoriEdit($id)
    {
        $data = Kategori::find($id);
        $fakultas = Fakultas::where("kode_fakultas",session()->get('fakultas'))->first();
        
        return Inertia::render('Kategori/KategoriForm', [
            'typeEvent' => "Edit", 
            "kategori"=>$data, 
            "level"=>session()->get('level'),
            "fakultas"=>$fakultas?->nama_fakultas
        ]);
    }
}
