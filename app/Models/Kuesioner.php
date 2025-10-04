<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

class Kuesioner extends Model
{
    use HasFactory;
    protected $table = 'kuesioner';

    public function BankSoal() : HasOne{
        return $this->hasOne(BankSoal::class, 'id', 'id_bank_soal');
    }

    public function Mahasiswa() : HasOne{
        return $this->hasOne(Mahasiswa::class, 'NIM', 'npm')
        ->select(
            'm_mahasiswa_simak.NIM',
            'm_mahasiswa_simak.nama_mahasiswa',
            'm_mahasiswa_simak.kode_fak',
            'm_mahasiswa_simak.kode_prodi',
            'm_fakultas.nama_fakultas',
            'm_program_studi.nama_prodi',
            DB::raw("
            (case 
                when m_mahasiswa_simak.kode_jenjang='C' then 's1' 
                when m_mahasiswa_simak.kode_jenjang='B' then 's2' 
                when m_mahasiswa_simak.kode_jenjang='A' then 's3' 
                when m_mahasiswa_simak.kode_jenjang='E' then 'd3' 
                when m_mahasiswa_simak.kode_jenjang='D' then 'd4'
                when m_mahasiswa_simak.kode_jenjang='J' then 'profesi'
                else null
            end) as jenjang 
            ")
        )
        ->join('m_fakultas','m_fakultas.kode_fakultas','=','m_mahasiswa_simak.kode_fak')
        ->join('m_program_studi','m_program_studi.kode_prodi','=','m_mahasiswa_simak.kode_prodi');
    }

    public function Dosen() : HasOne{
        return $this->hasOne(DosenTendik::class, 'nidn', 'nidn');
    }

    public function Tendik() : HasOne{
        return $this->hasOne(DosenTendik::class, 'nip', 'nip');
    }
}
