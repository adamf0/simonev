<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class EPribadi extends Model
{
    protected $table = 'e_pribadi';
    // protected $connection = 'simpeg';
    protected $fillable = ['*'];

    public function Payroll():HasOne{
        return $this->hasOne(PayrollMPegawai::class, 'nip', 'nip');
    }
    public function Pengangkatan():HasOne{
        return $this->hasOne(Pengangkatan::class, 'nip', 'nip');
    }
}
