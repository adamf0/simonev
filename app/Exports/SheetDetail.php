<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class SheetDetail implements FromCollection, WithHeadings, WithTitle
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

    public function title(): string
    {
        return 'Data Rekap';
    }
}