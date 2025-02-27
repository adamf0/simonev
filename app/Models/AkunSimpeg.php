<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AkunSimpeg extends Model
{
    protected $table = 'pengguna';
    protected $connection = 'simpeg';
    protected $fillable = ['*'];

    public function Pengangkatan():HasOne{
        return $this->hasOne(Pengangkatan::class, 'nip','username');
    }

    public function NPribadi():HasOne{
        return $this->hasOne(NPribadi::class, 'nip', 'username');
    }

    public function PayrollPegawai():HasOne{
        return $this->hasOne(PayrollMPegawai::class, 'nip', 'username');
    }
}
