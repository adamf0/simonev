<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class KuesionerJawaban extends Model
{
    use HasFactory;
    protected $table = 'kuesioner_jawaban';
}
