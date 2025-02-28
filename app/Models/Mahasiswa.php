<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Mahasiswa extends Model
{
    protected $table = 'm_mahasiswa';
    // protected $connection = 'simak';
    protected $fillable = ['*'];
}
