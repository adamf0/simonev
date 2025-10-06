<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fakultas extends Model
{
    protected $table = 'm_fakultas_simak';
    // protected $connection = 'simak';
    protected $fillable = ['*'];

    public function Prodis():HasMany{
        return $this->hasMany(Prodi::class, 'kode_fak', 'kode_fakultas');
    }
}
