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
            $item->rule->target_list = array_map('strtolower', $item->rule->target_list);

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

            // dd($item->rule->type, $item->rule->generate->type, $item->rule->target_type, $item->rule->target_list, $item, $start);
        }
        dump($bankSoal);
        // $bankSoal = $filter->filter(function($items) use($now){
        //     dump(
        //         [
        //             strtotime($now),strtotime($items->start_repair." 00:00:00"),strtotime($items->end_repair." 23:59:59"),
        //             strtotime($now) >= strtotime($items->start_repair." 00:00:00"), strtotime($now) <= strtotime($items->end_repair." 23:59:59")
        //         ]
        //     );
        //     return strtotime($now) >= strtotime($items->start_repair." 00:00:00") && strtotime($now) <= strtotime($items->end_repair." 23:59:59");
        // })->values();
        // dump($bankSoal);

        $bankSoal = $bankSoal->filter(function($items) use($peruntukan,$now,$target){
            $kolom = match($peruntukan){
                'mahasiswa'=>'npm',
                'dosen'=>'nidn',
                default => 'nip'
            };
            $active = strtotime($now) >= strtotime($items->start_repair." 00:00:00") || strtotime($now) <= strtotime($items->end_repair." 23:59:59");
            dump(
                [
                    [
                        strtotime($now), strtotime($items->start_repair." 00:00:00"), strtotime($items->end_repair." 23:59:59")
                    ],
                    strtotime($now) >= strtotime($items->start_repair." 00:00:00"), strtotime($now) <= strtotime($items->end_repair." 23:59:59")
                ]
            );
            
            $kuesioner = Kuesioner::where($kolom, $target)->whereBetween("tanggal",[$items->start_repair,$items->end_repair])->get();
            dump(Kuesioner::where($kolom, $target)->whereBetween("tanggal",[$items->start_repair,$items->end_repair])->toRawSql());
            $filtered = $active && ($kuesioner->count()==1 || $kuesioner->count()==0);
            
            if($kuesioner->count()>1){
                $kuesioner = "E-K1";
            } else if($kuesioner->count()==0){
                $kuesioner = "E-K0";
            } else {
                $kuesioner = $kuesioner->first();
                $kuesioner = $kuesioner->id_bank_soal==$items->id? $kuesioner:null;
            }
            
            $items->active_entry = $active;
            $items->kuesioner = $kuesioner;

            return $filtered;
        });
        dd($bankSoal);
        
        // dd([
        //     'bankSoal'=>$bankSoal,
        //     'peruntukan'=>$peruntukan,
        //     'prodi'=>$prodi,
        //     'fakultas'=>$fakultas,
        //     'unit'=>$unit,
        //     'target'=>$target,
        //     "level"=>session()->get('level')
        // ]);
        return Inertia::render('Kuesioner/Kuesioner', [
            'bankSoal'=>$bankSoal->values(),
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
        
        if(in_array($kuesioner->BankSoal['rule']['type'],["spesific","all"]) && $kuesioner->BankSoal['rule']['target_type']=="npm" && in_array($target,$kuesioner->BankSoal['rule']['target_list'])){
            if($kuesioner->BankSoal['rule']['generate']['type']=="recursive"){
                $kuesioner->start_repair = $start;
                $kuesioner->end_repair = $end;
            } else if($kuesioner->BankSoal['rule']['generate']['type']=="once"){
                $kuesioner->start_repair = $kuesioner->BankSoal['rule']['generate']['start'];
                $kuesioner->end_repair = $kuesioner->BankSoal['rule']['generate']['end'];
            }
        } else if(in_array($kuesioner->BankSoal['rule']['type'],["spesific","all"]) && $kuesioner->BankSoal['rule']['target_type']=="prodi" && in_array($prodi,$kuesioner->BankSoal['rule']['target_list'])){
            if($kuesioner->BankSoal['rule']['generate']['type']=="recursive"){
                $kuesioner->start_repair = $start;
                $kuesioner->end_repair = $end;
            } else if($kuesioner->BankSoal['rule']['generate']['type']=="once"){
                $kuesioner->start_repair = $kuesioner->BankSoal['rule']['generate']['start'];
                $kuesioner->end_repair = $kuesioner->BankSoal['rule']['generate']['end'];
            }
        } else if(in_array($kuesioner->BankSoal['rule']['type'],["spesific","all"]) && $kuesioner->BankSoal['rule']['target_type']=="fakultas" && in_array($fakultas,$kuesioner->BankSoal['rule']['target_list'])){
            if($kuesioner->BankSoal['rule']['generate']['type']=="recursive"){
                $kuesioner->start_repair = $start;
                $kuesioner->end_repair = $end;
            } else if($kuesioner->BankSoal['rule']['generate']['type']=="once"){
                $kuesioner->start_repair = $kuesioner->BankSoal['rule']['generate']['start'];
                $kuesioner->end_repair = $kuesioner->BankSoal['rule']['generate']['end'];
            }
        } else if(in_array($kuesioner->BankSoal['rule']['type'],["spesific","all"]) && $kuesioner->BankSoal['rule']['target_type']=="unit" && in_array($unit,$kuesioner->BankSoal['rule']['target_list'])){
            if($kuesioner->BankSoal['rule']['generate']['type']=="recursive"){
                $kuesioner->start_repair = $start;
                $kuesioner->end_repair = $end;
            } else if($kuesioner->BankSoal['rule']['generate']['type']=="once"){
                $kuesioner->start_repair = $kuesioner->BankSoal['rule']['generate']['start'];
                $kuesioner->end_repair = $kuesioner->BankSoal['rule']['generate']['end'];
            }
        } else if(in_array($kuesioner->BankSoal['rule']['type'],["spesific","all"]) && $kuesioner->BankSoal['rule']['target_type']==null && in_array($unit,$kuesioner->BankSoal['rule']['target_list'])){
            if($kuesioner->BankSoal['rule']['generate']['type']=="recursive"){
                $kuesioner->start_repair = $start;
                $kuesioner->end_repair = $end;
            } else if($kuesioner->BankSoal['rule']['generate']['type']=="once"){
                $kuesioner->start_repair = $kuesioner->BankSoal['rule']['generate']['start'];
                $kuesioner->end_repair = $kuesioner->BankSoal['rule']['generate']['end'];
            }
        } 

        $pertanyaan = TemplatePertanyaan::with(['Kategori','SubKategori','TemplatePilihan'])->where('id_bank_soal',$kuesioner->id_bank_soal)->get();
        $jawaban = KuesionerJawaban::where("id_kuesioner",$kuesioner->id)->get();
        $pertanyaanRequired = $pertanyaan->where('required',1)->pluck('id');

        $pertanyaan = $pertanyaan->map(function($item) use($jawaban){
            $selected = $jawaban->where('id_template_pertanyaan',$item->id);
            $freeText = $selected->filter(fn($s)=>!empty($s->freeText))->first()?->freeText;

            $item->selected = $selected->pluck('id_template_jawaban');
            $item->freeText = $freeText;
            $item->pattern = $item->Kategori?->nama_kategori."||".$item->SubKategori?->nama_sub;
            unset($item->Kategori);
            unset($item->SubKategori);

            return $item;
        });
        $groupPertanyaan = $pertanyaan->groupBy("pattern");

        return Inertia::render('Kuesioner/KuesionerForm', ['kuesioner'=>$kuesioner, 'groupPertanyaan'=>$groupPertanyaan, 'pertanyaanRequired'=>$pertanyaanRequired, "level"=>session()->get('level'), "mode"=>$type]);
    }
}
