<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\SubKategori;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SubKategoriController extends Controller
{
    // function __construct()
    // {
    //     parent::__construct();
    // }

    public function SubKategori($id_kategori)
    {
        $kategori = Kategori::findOrFail($id_kategori);
        return Inertia::render('SubKategori/SubKategori', ["kategori"=> $kategori, "level"=>session()->get('level')]);
    }

    public function SubKategoriEdit($id_kategori, $id)
    {
        $kategori = Kategori::findOrFail($id_kategori);
        $data = SubKategori::find($id);
        
        return Inertia::render('SubKategori/SubKategoriForm', ['typeEvent' => "Edit", "kategori"=> $kategori, "subkategori"=>$data, "level"=>session()->get('level')]);
    }
}
