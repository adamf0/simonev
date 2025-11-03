<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class EPribadiOri extends Model
{
    protected $table = 'e_pribadi';
    protected $connection = 'simpeg';
    protected $fillable = ['*'];

    public function Payroll():HasOne{
        return $this->hasOne(PayrollMPegawaiOri::class, 'nip', 'nip');
    }
    public function Pengangkatan():HasOne{
        return $this->hasOne(PengangkatanOri::class, 'nip', 'nip');
    }
}
