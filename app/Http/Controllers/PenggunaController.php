<?php

namespace App\Http\Controllers;

use App\Models\Fakultas;
use App\Models\User;
use Inertia\Inertia;

class PenggunaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function pengguna()
    {
        $listFakultas = Fakultas::select('kode_fakultas','nama_fakultas')->get();
        return Inertia::render('Pengguna/Pengguna', ['level'=>session()->get('level'), 'listFakultas'=>$listFakultas]);
    }

    public function penggunaEdit($id)
    {
        $user = User::findOrFail($id);
        $listFakultas = Fakultas::select('kode_fakultas','nama_fakultas')->get();

        return Inertia::render('Pengguna/PenggunaForm', ['level'=>session()->get('level'), 'pengguna'=>$user, 'listFakultas'=>$listFakultas]);
    }
}
