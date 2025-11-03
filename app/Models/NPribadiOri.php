<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NPribadiOri extends Model
{
    protected $table = 'n_pribadi';
    protected $connection = 'simpeg';
    protected $fillable = ['*'];
}
