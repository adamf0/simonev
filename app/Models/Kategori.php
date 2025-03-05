<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kategori extends Model
{
    protected $table = 'kategori';
    // protected $connection = 'simak';
    protected $fillable = ['*'];

    public function SubKategori():HasMany{
        return $this->hasMany(SubKategori::class, 'sub_kategori', 'id');
    }
}
