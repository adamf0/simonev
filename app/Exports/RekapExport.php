<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class RekapExport implements WithMultipleSheets
{
    protected $sheet1, $sheet2;

    public function __construct($sheet1, $sheet2)
    {
        $this->sheet1 = $sheet1;
        $this->sheet2 = $sheet2;
    }

    public function sheets(): array
    {
        return [
            new SheetRekap($this->sheet1),
            new SheetDetail($this->sheet2),
        ];
    }
}