<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengangkatanOri extends Model
{
    protected $table = 'n_pengangkatan';
    protected $connection = 'simpeg';
    protected $fillable = ['*'];
}
