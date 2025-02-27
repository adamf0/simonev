<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\Kuesioner;
use App\Models\TemplatePertanyaan;
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
        return Inertia::render('TemplatePertanyaan/TemplatePertanyaanForm', ['type'=>'Add','bankSoal'=>$bankSoal,'templatePertanyaan'=>null,"level"=>session()->get('level')]);
    }

    public function pertanyaanEdit($id_bank_soal, $id_pertanyaan)
    {
        $bankSoal = BankSoal::findOrFail($id_bank_soal);
        $templatePertanyaan = TemplatePertanyaan::findOrFail($id_pertanyaan);
        return Inertia::render('TemplatePertanyaan/TemplatePertanyaanForm', ['type'=>'Edit','bankSoal'=>$bankSoal,'templatePertanyaan'=>$templatePertanyaan, "level"=>session()->get('level')]);
    }
}
