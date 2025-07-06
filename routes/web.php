<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BankSoalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\KuesionerController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\SubKategoriController;
use App\Http\Controllers\TemplatePertanyaanController;
use App\Http\Middleware\CheckSession;
use Illuminate\Support\Facades\Route;

// Route::get('/', function () {
//     return view('welcome');
// });

Route::get('/', [AuthController::class, 'index'])->name('/');
Route::post('/propagation', [AuthController::class, 'propagation'])->name('propagation');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/kuesioner/done', [KuesionerController::class,"done"])->name('kuesioner.done'); 

Route::middleware([CheckSession::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/pengguna', [PenggunaController::class,"pengguna"])->name('pengguna');
    Route::get('/pengguna/{id}/edit', [PenggunaController::class,"penggunaEdit"])->name('pengguna.edit');
    
    Route::get('/bankSoal', [BankSoalController::class,"bankSoal"])->name('bankSoal');
    Route::get('/bankSoal/{id_bank_soal}/edit', [BankSoalController::class,"bankSoalEdit"])->name('bankSoal.edit');
    Route::get('/bankSoal/{id_bank_soal}/preview', [BankSoalController::class,"bankSoalPreview"])->name('bankSoal.preview');
    
    Route::get('/bankSoal/{id_bank_soal}/pertanyaan', [TemplatePertanyaanController::class,"pertanyaan"])->name('pertanyaan');
    Route::get('/bankSoal/{id_bank_soal}/pertanyaan/add', [TemplatePertanyaanController::class,"pertanyaanAdd"])->name('pertanyaan.add');
    Route::get('/bankSoal/{id_bank_soal}/pertanyaan/{id_pertanyaan}/edit', [TemplatePertanyaanController::class,"pertanyaanEdit"])->name('pertanyaan.edit');
    
    Route::get('/kuesioner', [KuesionerController::class,"kuesioner"])->name('kuesioner');
    Route::get('/kuesioner/{type}/{id}', [KuesionerController::class,"kuesionerEdit"])->name('kuesioner.edit');
    
    Route::get('/laporan/rekap', [LaporanController::class,"rekap"])->name('kuesioner.rekap');
    Route::get('/laporan', [LaporanController::class,"laporan"])->name('kuesioner.laporan');
    
    Route::get('/kategori', [KategoriController::class,"kategori"])->name('kategori');
    Route::get('/kategori/{id}/edit', [KategoriController::class,"kategoriEdit"])->name('kategori.edit');
    
    Route::get('/kategori/{id_kategori}/sub', [SubKategoriController::class,"subKategori"])->name('subKategori');
    Route::get('/kategori/{id_kategori}/sub/{id}/edit', [SubKategoriController::class,"subKategoriEdit"])->name('subKategori.edit');
    
    Route::get('/pengguna', [PenggunaController::class,"pengguna"])->name('pengguna');
    Route::get('/pengguna/{id}/edit', [PenggunaController::class,"penggunaEdit"])->name('pengguna.edit');
    // Route::resource('/rencana-evaluasi', RencanaEvaluasiController::class);
});