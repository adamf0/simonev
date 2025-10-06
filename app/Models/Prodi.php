<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Prodi extends Model
{
    protected $table = 'm_program_studi';
    protected $connection = 'simak';
    protected $fillable = ['*'];

    function fakultas(): HasOne{
        return $this->hasOne(Fakultas::class, 'kode_fakultas', 'kode_fak');
    }
}
