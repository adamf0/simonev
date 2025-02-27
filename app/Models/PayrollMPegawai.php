<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollMPegawai extends Model
{
    protected $table = 'payroll_m_pegawai';
    protected $connection = 'simpeg';
    protected $fillable = ['*'];
}
