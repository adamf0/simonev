<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemplatePilihan extends Model
{
    use HasFactory;
    protected $table = 'template_pilihan';

    public function TemplatePertanyaan():BelongsTo{
        return $this->belongsTo(TemplatePertanyaan::class, 'id', 'id_template_soal');
    }
}
