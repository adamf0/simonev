<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AkunSimakOri extends Model
{
    protected $table = 'user';
    protected $connection = 'simak';
    protected $fillable = ['*'];

    public function Dosen():HasOne{
        return $this->hasOne(DosenOri::class, 'NIDN', 'userid');
    }
    public function Mahasiswa():HasOne{
        return $this->hasOne(MahasiswaOri::class, 'NIM', 'userid');
    }
}
