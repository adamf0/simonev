<?php

use App\Http\Controllers\Api\FeederController;
use App\Http\Controllers\BankSoalApiController;
use App\Http\Controllers\KategoriApiController;
use App\Http\Controllers\KuesionerApiController;
use App\Http\Controllers\LaporanApiController;
use App\Http\Controllers\PenggunaApiController;
use App\Http\Controllers\SubKategoriApiController;
use App\Http\Controllers\TemplatePertanyaanApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
Route::get('/pengguna', [PenggunaApiController::class, 'listPengguna'])->name('api.pengguna.list');
Route::post('/pengguna/save', [PenggunaApiController::class, 'save'])->name('api.pengguna.add');
Route::post('/pengguna/update', [PenggunaApiController::class, 'update'])->name('api.pengguna.update');
Route::post('/pengguna/delete', [PenggunaApiController::class, 'delete'])->name('api.pengguna.delete');

Route::get('/bankSoal', [BankSoalApiController::class, 'listBankSoal'])->name('api.bankSoal.list');
Route::post('/bankSoal/save', [BankSoalApiController::class, 'save'])->name('api.bankSoal.add');
Route::post('/bankSoal/update', [BankSoalApiController::class, 'update'])->name('api.bankSoal.update');
Route::post('/bankSoal/copy', [BankSoalApiController::class, 'copy'])->name('api.bankSoal.copy');
Route::get('/bankSoal/status/{id}/{status}', [BankSoalApiController::class, 'status'])->name('api.bankSoal.status');
Route::post('/bankSoal/delete', [BankSoalApiController::class, 'delete'])->name('api.bankSoal.delete');

Route::get('/templatePertanyaan', [TemplatePertanyaanApiController::class, 'listTemplatePertanyaan'])->name('api.templatePertanyaan.list');
Route::post('/templatePertanyaan/save', [TemplatePertanyaanApiController::class, 'save'])->name('api.templatePertanyaan.add');
Route::post('/templatePertanyaan/delete', [TemplatePertanyaanApiController::class, 'delete'])->name('api.templatePertanyaan.delete');

Route::get('/templateJawaban/{id_template_soal}', [TemplatePertanyaanApiController::class, 'listTemplatePilihan'])->name('api.templatePilihan.list');
Route::post('/templateJawaban/save', [TemplatePertanyaanApiController::class, 'savePilihan'])->name('api.templatePilihan.addPilihan');
Route::post('/templateJawaban/delete', [TemplatePertanyaanApiController::class, 'deletePilihan'])->name('api.templatePilihan.deletePilihan');

Route::get('/kuesioner', [KuesionerApiController::class, 'listKuesioner'])->name('api.kuesioner.list');
Route::post('/kuesioner/save', [KuesionerApiController::class, 'save'])->name('api.kuesioner.add');
Route::post('/kuesioner/delete', [KuesionerApiController::class, 'delete'])->name('api.kuesioner.delete');
Route::get('/kuesioner/active', [KuesionerApiController::class, 'listKuesionerActive'])->name('api.kuesioner.listActive');

Route::get('/kuesioner/rekap', [LaporanApiController::class, 'rekap'])->name('api.kuesioner.rekap');
Route::get('/kuesioner/laporan', [LaporanApiController::class, 'laporan'])->name('api.kuesioner.laporan');

Route::get('/kategori', [KategoriApiController::class, 'listkategori'])->name('api.kategori.list');
Route::post('/kategori/save', [KategoriApiController::class, 'save'])->name('api.kategori.add');
Route::post('/kategori/update', [KategoriApiController::class, 'update'])->name('api.kategori.update');
Route::post('/kategori/delete', [KategoriApiController::class, 'delete'])->name('api.kategori.delete');

Route::get('/subkategori', [SubKategoriApiController::class, 'listsubKategori'])->name('api.subKategori.list');
Route::post('/subkategori/save', [SubKategoriApiController::class, 'save'])->name('api.subKategori.add');
Route::post('/subkategori/update', [SubKategoriApiController::class, 'update'])->name('api.subKategori.update');
Route::post('/subkategori/delete', [SubKategoriApiController::class, 'delete'])->name('api.subKategori.delete');