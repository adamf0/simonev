<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FakultasOri extends Model
{
    protected $table = 'm_fakultas';
    protected $connection = 'simak';
    protected $fillable = ['*'];

    public function Prodis():HasMany{
        return $this->hasMany(ProdiOri::class, 'kode_fak', 'kode_fakultas');
    }
}
