<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TemplatePertanyaan extends Model
{
    use HasFactory;
    protected $table = 'template_pertanyaan';

    public function TemplatePilihan():HasMany{
        return $this->hasMany(TemplatePilihan::class, 'id_template_soal', 'id');
    }
}
