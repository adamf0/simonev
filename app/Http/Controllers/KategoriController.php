<?php

namespace App\Http\Controllers;

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
        return Inertia::render('Kategori/Kategori', ["level"=>session()->get('level')]);
    }

    public function KategoriEdit($id)
    {
        $data = Kategori::find($id);
        
        return Inertia::render('Kategori/KategoriForm', ['typeEvent' => "Edit", "kategori"=>$data, "level"=>session()->get('level')]);
    }
}
