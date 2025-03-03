<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\Kuesioner;
use App\Models\KuesionerJawaban;
use App\Models\TemplatePertanyaan;
use Carbon\Exceptions\InvalidFormatException;
use Inertia\Inertia;

class KuesionerController extends Controller
{
    // function __construct()
    // {
    //     parent::__construct();
    // }

    function isDateBetween($date, $startDate, $endDate) {
        $date = strtotime($date);
        $startDate = strtotime($startDate);
        $endDate = strtotime($endDate);
    
        return ($date >= $startDate || $date <= $endDate);
    }
    function replaceDateFormatIfEndDate($date, $slug="", $yearValue=null){
        $split = explode("-",$date);
        if(count($split)<3) throw new InvalidFormatException("format tanggal $slug tidak valid");
        
        $endDateOfMonth = date($split[0]."-".$split[1]."-t");
        [$_, $month, $day] = explode("-",$endDateOfMonth);

        $year = date("Y");

        if($month=="02" && $day!=$split[2] && in_array($day, [28,29]) && in_array($split[2],[28,29])){ //cek tanggal rule itu termasuk tanggal akhir bulan
            return date(($yearValue==null? "Y":$yearValue)."-$month-t");
        } else{
            return ($yearValue==null? $year:$yearValue)."-".$split[1]."-".$split[2];
        }
    }

    public function kuesioner()
    {
        $peruntukan = session()->get('level');
        $fakultas = session()->get('fakultas');
        $prodi = session()->get('prodi');
        $unit = session()->get('unit');
        $target = match($peruntukan){
            'mahasiswa'=>session()->get('id'),
            'dosen'=>session()->get('nidn'),
            default=>session()->get('nip'),
        };

        $bankSoal = BankSoal::where('peruntukan',$peruntukan)->where('status','active')->get()->transform(function($item){
            $item->rule = json_decode($item->rule);
            return $item;
        });
        
        $now = date('Y-m-d');
        $filter = collect([]);
        foreach($bankSoal as $item){
            $start = date($this->replaceDateFormatIfEndDate($item->rule->generate->start,"slug"));
            $end = date($this->replaceDateFormatIfEndDate($item->rule->generate->end,"slug"));

            $item->start_repair = $item->rule->generate->start;
            $item->end_repair = $item->rule->generate->end;

            if($item->rule->type=="spesific" && $item->rule->target_type=="npm" && (in_array("all",$item->rule->target_list) || in_array($target,$item->rule->target_list)) ){
                if($item->rule->generate->type=="once" && $this->isDateBetween($now, $item->rule->generate->start, $item->rule->generate->end)){
                    $filter->add($item);
                } else if($item->rule->generate->type=="recursive" && $this->isDateBetween($now,$start,$end)){
                    $item->start_repair = $start;
                    $item->end_repair = $end;
                    $filter->add($item);
                } 
                else if($item->rule->generate->type=="nolimit"){
                    $filter->add($item);
                }
            } else if($item->rule->type=="spesific" && $item->rule->target_type=="prodi" && (in_array("all",$item->rule->target_list) || in_array($prodi,$item->rule->target_list)) ){
                if($item->rule->generate->type=="once" && $this->isDateBetween($now, $item->rule->generate->start, $item->rule->generate->end)){
                    $filter->add($item);
                } else if($item->rule->generate->type=="recursive" && $this->isDateBetween($now,$start,$end)){
                    $item->start_repair = $start;
                    $item->end_repair = $end;
                    $filter->add($item);
                } 
                else if($item->rule->generate->type=="nolimit"){
                    $filter->add($item);
                }
            } else if($item->rule->type=="spesific" && $item->rule->target_type=="fakultas" && (in_array("all",$item->rule->target_list) || in_array($fakultas,$item->rule->target_list)) ){
                if($item->rule->generate->type=="once" && $this->isDateBetween($now, $item->rule->generate->start, $item->rule->generate->end)){
                    $filter->add($item);
                } else if($item->rule->generate->type=="recursive" && $this->isDateBetween($now,$start,$end)){
                    $item->start_repair = $start;
                    $item->end_repair = $end;
                    $filter->add($item);
                } 
                else if($item->rule->generate->type=="nolimit"){
                    $filter->add($item);
                }
            } else if($item->rule->type=="spesific" && $item->rule->target_type=="unit" && (in_array("all",$item->rule->target_list) || in_array($unit,$item->rule->target_list)) ){
                if($item->rule->generate->type=="once" && $this->isDateBetween($now, $item->rule->generate->start, $item->rule->generate->end)){
                    $filter->add($item);
                } else if($item->rule->generate->type=="recursive" && $this->isDateBetween($now,$start,$end)){
                    $item->start_repair = $start;
                    $item->end_repair = $end;
                    $filter->add($item);
                } 
                else if($item->rule->generate->type=="nolimit"){
                    $filter->add($item);
                }
            } else if($item->rule->type=="all"){
                if($item->rule->generate->type=="once" && $this->isDateBetween(date('Y-m-d'), $item->rule->generate->start, $item->rule->generate->end)){
                    $filter->add($item);
                } else if($item->rule->generate->type=="recursive" && $this->isDateBetween($now,$start,$end)){
                    $item->start_repair = $start;
                    $item->end_repair = $end;
                    $filter->add($item);
                } 
                else if($item->rule->generate->type=="nolimit"){
                    $filter->add($item);
                }
            }
        }

        $bankSoal = $filter->first();
        $kuesioner = null;
        
        if($filter->count()>1){
            $bankSoal = "E-B1";
        } else if($filter->count()==0){
            $bankSoal = "E-B0";
        } else{
            $kolom = match($peruntukan){
                'mahasiswa'=>'npm',
                'dosen'=>'nidn',
                default => 'nip'
            };
            
            dump($kolom, $target, session()->all());
            $bankSoal->active_entry = strtotime($now) >= strtotime($bankSoal->start_repair." 00:00:00") || strtotime($now) <= strtotime($bankSoal->end_repair." 23:59:59");
            $kuesioner = Kuesioner::where($kolom, $target)->whereBetween("tanggal",[$bankSoal->start_repair,$bankSoal->end_repair])->toRawSql();
            dd($kuesioner);

            if($kuesioner->count()>1){
                $kuesioner = "E-K1";
            } else if($kuesioner->count()==0){
                $kuesioner = "E-K0";
            } else {
                $kuesioner = $kuesioner->first();
            }
        }

        return Inertia::render('Kuesioner/Kuesioner', [
            'kuesioner'=>$kuesioner,
            'bankSoal'=>$bankSoal,
            'peruntukan'=>$peruntukan,
            'prodi'=>$prodi,
            'fakultas'=>$fakultas,
            'unit'=>$unit,
            'target'=>$target,
            "level"=>session()->get('level')
        ]);
    }

    public function kuesionerEdit($type="start",$id)
    {
        $kuesioner = Kuesioner::with(['BankSoal'])->findOrFail($id);
        $kuesioner->BankSoal->rule = json_decode($kuesioner->BankSoal->rule,true);

        $now = date('Y-m-d');
        $yearEntry = date('Y', strtotime($kuesioner->tanggal));
        $start = date($this->replaceDateFormatIfEndDate($kuesioner->BankSoal['rule']['generate']['start'],"slug", $yearEntry));
        $end = date($this->replaceDateFormatIfEndDate($kuesioner->BankSoal['rule']['generate']['end'],"slug", $yearEntry));
        
        $peruntukan = session()->get('level');
        $fakultas = session()->get('fakultas');
        $prodi = session()->get('prodi');
        $unit = session()->get('unit');
        $target = match($kuesioner->BankSoal->peruntukan){
            'mahasiswa'=>session()->get('npm'),
            'dosen'=>session()->get('nidn'),
            default=>session()->get('nip'),
        };

        $kuesioner->start_repair = $kuesioner->BankSoal['rule']['generate']['start'];
        $kuesioner->end_repair = $kuesioner->BankSoal['rule']['generate']['end'];
        
        if($kuesioner->BankSoal['rule']['type']=="spesific" && $kuesioner->BankSoal['rule']['target_type']=="npm" && in_array($target,$kuesioner->BankSoal['rule']['target_list'])){
            if($kuesioner->BankSoal['rule']['generate']['type']=="recursive"){
                $kuesioner->start_repair = $start;
                $kuesioner->end_repair = $end;
            }
        } else if($kuesioner->BankSoal['rule']['type']=="spesific" && $kuesioner->BankSoal['rule']['target_type']=="prodi" && in_array($prodi,$kuesioner->BankSoal['rule']['target_list'])){
            if($kuesioner->BankSoal['rule']['generate']['type']=="recursive"){
                $kuesioner->start_repair = $start;
                $kuesioner->end_repair = $end;
            }
        } else if($kuesioner->BankSoal['rule']['type']=="spesific" && $kuesioner->BankSoal['rule']['target_type']=="fakultas" && in_array($fakultas,$kuesioner->BankSoal['rule']['target_list'])){
            if($kuesioner->BankSoal['rule']['generate']['type']=="recursive"){
                $kuesioner->start_repair = $start;
                $kuesioner->end_repair = $end;
            }
        } else if($kuesioner->BankSoal['rule']['type']=="spesific" && $kuesioner->BankSoal['rule']['target_type']=="unit" && in_array($unit,$kuesioner->BankSoal['rule']['target_list'])){
            if($kuesioner->BankSoal['rule']['generate']['type']=="recursive"){
                $kuesioner->start_repair = $start;
                $kuesioner->end_repair = $end;
            }
        } else if($kuesioner->BankSoal['rule']['type']=="all"){
            if($kuesioner->BankSoal['rule']['generate']['type']=="recursive"){
                $kuesioner->start_repair = $start;
                $kuesioner->end_repair = $end;
            }
        }

        $pertanyaan = TemplatePertanyaan::with(['TemplatePilihan'])->where('id_bank_soal',$kuesioner->id_bank_soal)->get();
        $jawaban = KuesionerJawaban::where("id_kuesioner",$kuesioner->id)->get();

        $pertanyaan = $pertanyaan->map(function($item) use($jawaban){
            $selected = $jawaban->where('id_template_pertanyaan',$item->id)->pluck('id_template_jawaban');
            $item->selected = $selected;
            return $item;
        });

        return Inertia::render('Kuesioner/KuesionerForm', ['kuesioner'=>$kuesioner, 'dataPertanyaan'=>$pertanyaan, "level"=>session()->get('level'), "mode"=>$type]);
    }
}
