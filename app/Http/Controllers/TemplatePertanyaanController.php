<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\Fakultas;
use App\Models\Kategori;
use App\Models\Kuesioner;
use App\Models\TemplatePertanyaan;
use App\Models\TemplatePilihan;
use Carbon\Exceptions\InvalidFormatException;
use Inertia\Inertia;

class TemplatePertanyaanController extends Controller
{
    // function __construct()
    // {
    //     parent::__construct();
    // }

    public function pertanyaan($id_bank_soal)
    {
        $bankSoal = BankSoal::findOrFail($id_bank_soal);
        return Inertia::render('TemplatePertanyaan/TemplatePertanyaan', ['bankSoal'=>$bankSoal,"level"=>session()->get('level')]);
    }

    public function pertanyaanAdd($id_bank_soal)
    {
        $bankSoal = BankSoal::findOrFail($id_bank_soal);
        $listKategori = Kategori::with('SubKategori')->get();
        $fakultas = Fakultas::where("kode_fakultas",session()->get('fakultas'))->first();

        return Inertia::render('TemplatePertanyaan/TemplatePertanyaanForm', [
            'type'=>'Add',
            'bankSoal'=>$bankSoal,
            'templatePertanyaan'=>null,
            'listKategori'=> $listKategori,
            "level"=>session()->get('level'),
            "fakultas"=>$fakultas?->nama_fakultas
        ]);
    }

    public function pertanyaanEdit($id_bank_soal, $id_pertanyaan)
    {
        $bankSoal = BankSoal::findOrFail($id_bank_soal);
        $templatePertanyaan = TemplatePertanyaan::findOrFail($id_pertanyaan);
        $listKategori = Kategori::with(['SubKategori'])->get();
        $hasFreeText = TemplatePilihan::where('id_template_soal',$id_pertanyaan)->where('isFreeText',1)->count();
        $fakultas = Fakultas::where("kode_fakultas",session()->get('fakultas'))->first();

        return Inertia::render('TemplatePertanyaan/TemplatePertanyaanForm', [
            'type'=>'Edit',
            'hasFreeText'=>$hasFreeText,
            'bankSoal'=>$bankSoal,
            'templatePertanyaan'=>$templatePertanyaan,
            'listKategori'=> $listKategori, 
            "level"=>session()->get('level'),
            "fakultas"=>$fakultas?->nama_fakultas
        ]);
    }
}
