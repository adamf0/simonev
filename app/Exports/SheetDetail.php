<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class SheetDetail implements FromCollection, WithHeadings
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return collect($this->data);
    }

    public function headings(): array
    {
        return [
            'Tanggal',
            'Peruntukan',
            'Bank Soal',
            'Nama Mahasiswa',
            'Fakultas Mahasiswa',
            'Prodi Mahasiswa',
            'Nama Dosen',
            'Fakultas Dosen',
            'Prodi Dosen',
            'Nama Tendik',
            'Unit Kerja',
        ];
    }
}