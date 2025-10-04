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

    public function Jawaban()
    {
        return $this->hasMany(KuesionerJawaban::class, 'id_kuesioner', 'id');
    }

    public function Pertanyaan()
    {
        // lewat relasi jawaban -> pertanyaan
        return $this->hasManyThrough(
            TemplatePertanyaan::class,
            KuesionerJawaban::class,
            'id_kuesioner',         // foreign key di kuesioner_jawaban
            'id',                   // foreign key di template_pertanyaan
            'id',                   // local key di v_kuesioner
            'id_template_pertanyaan'// local key di kuesioner_jawaban
        );
    }

    public function Pilihan()
    {
        // lewat relasi jawaban -> pilihan
        return $this->hasManyThrough(
            TemplatePilihan::class,
            KuesionerJawaban::class,
            'id_kuesioner',
            'id',
            'id',
            'id_template_jawaban'
        );
    }
}
