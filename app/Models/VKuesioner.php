<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VKuesioner extends Model
{
    protected $table = 'v_kuesioner';
    protected $fillable = ['*'];

    public function Mahasiswa(){
        return $this->hasOne(Mahasiswa::class, 'NIM','npm');   
    }
    public function Dosen(){
        return $this->hasOne(Dosen::class, 'NIDN','nidn');   
    }
    public function Tendik(){
        return $this->hasOne(VTendik::class, 'nip','nip');   
    }
}
