<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TemplatePertanyaan extends Model
{
    use HasFactory;
    protected $table = 'template_pertanyaan';

    public function TemplatePilihan():HasMany{
        return $this->hasMany(TemplatePilihan::class, 'id_template_soal', 'id');
    }
    public function Kategori():HasOne{
        return $this->hasOne(Kategori::class, 'id', 'id_kategori');
    }
    public function SubKategori():HasOne{
        return $this->hasOne(SubKategori::class, 'id', 'id_sub_kategori');
    }
}
