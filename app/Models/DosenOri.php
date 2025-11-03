<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DosenOri extends Model
{
    protected $table = 'm_dosen';
    protected $connection = 'simak';
    protected $fillable = ['*'];

    public function Fakultas():HasOne{
        return $this->hasOne(FakultasOri::class, 'kode_fakultas', 'kode_fak');
    }

    public function Prodi():HasOne{
        return $this->hasOne(ProdiOri::class, 'kode_prodi', 'kode_prodi');
    }

    public function EPribadi():HasOne{
        return $this->hasOne(EPribadiOri::class, 'nidn', 'NIDN');
    }
}
