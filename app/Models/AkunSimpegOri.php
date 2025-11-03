<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AkunSimpegOri extends Model
{
    protected $table = 'pengguna';
    protected $connection = 'simpeg';
    protected $fillable = ['*'];

    public function Pengangkatan():HasOne{
        return $this->hasOne(PengangkatanOri::class, 'nip','username');
    }

    public function NPribadi():HasOne{
        return $this->hasOne(NPribadiOri::class, 'nip', 'username');
    }

    public function PayrollPegawai():HasOne{
        return $this->hasOne(PayrollMPegawaiOri::class, 'nip', 'username');
    }
}
