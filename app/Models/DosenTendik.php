<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

class DosenTendik extends Model
{
    protected $table = 'v_tendik';
    protected $connection = 'simpeg';
    protected $fillable = ['*'];

    function EPribadi():HasOne{
        return $this->hasOne(EPribadi::class, 'nip', 'nip')->select('nip','nidn','nama');
    }

    function NPribadi():HasOne{
        return $this->hasOne(NPribadi::class, 'nip', 'nip')->select('nip','nama');
    }

    function Pengangkatan():HasOne{
        return $this->hasOne(Pengangkatan::class, 'nip', 'nip')->select('nip',DB::raw('RTRIM(REPLACE(unit_kerja, "F.", "FAKULTAS")) as unit_kerja'));
    }
}
