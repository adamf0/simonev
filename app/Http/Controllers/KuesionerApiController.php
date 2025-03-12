<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\Kuesioner;
use App\Models\KuesionerJawaban;
use Carbon\Exceptions\InvalidFormatException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KuesionerApiController extends Controller
{
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
    
    public function listKuesioner(Request $request)
    {
        sleep(3);

        $results = DB::table('kuesioner')
                        ->selectRaw(
                            "
                            kuesioner.*, 
                            bank_soal.judul,
                            bank_soal.deskripsi,
                            bank_soal.rule,
                            (CASE 
                                WHEN kuesioner.npm IS NOT NULL THEN 'mahasiswa'
                                WHEN kuesioner.nidn IS NOT NULL THEN 'dosen'
                                WHEN kuesioner.nip IS NOT NULL THEN 'tendik'
                                ELSE null
                            END) as peruntukan"
                        );

                    if ($request->filled("bank_soal")) {
                        $results = $results->where('bank_soal.judul', $request->bank_soal);
                    }

                    if ($request->filled("peruntukan")) {
                        $kolom = match($request->peruntukan){
                            "dosen"=>"nidn",
                            "tendik"=>"nip",
                            default=>"npm",
                        };
                        $results = $results->whereNotNull("kuesioner.$kolom");
                    }

                    if ($request->filled("data")) {
                        $kolom = match($request->peruntukan){
                            "dosen"=>"nidn",
                            "tendik"=>"nip",
                            default=>"npm",
                        };
                        $results = $results->where("kuesioner.$kolom", $request->data);
                    }

                    $results = $results->join('bank_soal', 'kuesioner.id_bank_soal', '=', 'bank_soal.id')
                        ->orderByDesc('kuesioner.tanggal')
                        ->paginate(5);

                    $results->getCollection()->transform(function ($item) use($request){
                        $yearEntry = date('Y', strtotime($item->tanggal));
                        $item->rule = json_decode($item->rule, true);

                        $now = date('Y-m-d');
                        $start = $item->rule['generate']['start'];
                        $end = $item->rule['generate']['end'];
                        $item->open_edit = strtotime($now) >= strtotime($start." 00:00:00") || strtotime($now) <= strtotime($end." 23:59:59");

                        if($item->rule['type']=="spesific" && $item->rule['target_type']=="npm" && (in_array("all",$item->rule['target_list']) || in_array($request->data,$item->rule['target_list'])) ){
                            if($item->rule['generate']['type']=="recursive"){
                                $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));
                                
                                $item->start_repair = $start;
                                $item->end_repair = $end;
                                $item->open_edit = date('Y', strtotime($now))==$yearEntry && (strtotime($now) >= strtotime($start." 00:00:00") || strtotime($now) <= strtotime($end." 23:59:59"));
                            }
                        } else if($item->rule['type']=="spesific" && $item->rule['target_type']=="prodi" && (in_array("all",$item->rule['target_list']) || in_array($request->data,$item->rule['target_list'])) ){
                            if($item->rule['generate']['type']=="recursive"){
                                $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));

                                $item->start_repair = $start;
                                $item->end_repair = $end;
                                $item->open_edit = date('Y', strtotime($now))==$yearEntry && (strtotime($now) >= strtotime($start." 00:00:00") || strtotime($now) <= strtotime($end." 23:59:59"));
                            }
                        } else if($item->rule['type']=="spesific" && $item->rule['target_type']=="fakultas" && (in_array("all",$item->rule['target_list']) || in_array($request->data,$item->rule['target_list'])) ){
                            if($item->rule['generate']['type']=="recursive"){
                                $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));

                                $item->start_repair = $start;
                                $item->end_repair = $end;
                                $item->open_edit = date('Y', strtotime($now))==$yearEntry && (strtotime($now) >= strtotime($start." 00:00:00") || strtotime($now) <= strtotime($end." 23:59:59"));
                            }
                        } else if($item->rule['type']=="spesific" && $item->rule['target_type']=="unit" && (in_array("all",$item->rule['target_list']) || in_array($request->data,$item->rule['target_list'])) ){
                            if($item->rule['generate']['type']=="recursive"){
                                $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));

                                $item->start_repair = $start;
                                $item->end_repair = $end;
                                $item->open_edit = date('Y', strtotime($now))==$yearEntry && (strtotime($now) >= strtotime($start." 00:00:00") || strtotime($now) <= strtotime($end." 23:59:59"));
                            }
                        } else if($item->rule['type']=="all"){
                            if($item->rule['generate']['type']=="recursive"){
                                $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));

                                $item->start_repair = $start;
                                $item->end_repair = $end;
                                $item->open_edit = date('Y', strtotime($now))==$yearEntry && (strtotime($now) >= strtotime($start." 00:00:00") || strtotime($now) <= strtotime($end." 23:59:59"));
                            }
                        }
                        
                        return $item;
                    });

        return response()->json([
            'data' => $results->items(),
            'currentPage' => $results->currentPage(),
            'total' => $results->total(),
            'lastPage' => $results->lastPage(),
        ]);
    }
    public function delete(Request $request){
        sleep(3);
        
        try {
            Kuesioner::whereIn('id',$request->id)->delete();
    
            return response()->json([
                "message"=>"berhasil hapus data template pertanyaan",
                "validation"=>[],
                "trace"=>null
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message"=>"ups ada error",
                "validation"=>[],
                "trace"=>$th->getTrace()
            ],500);
        }
    }
    public function save(Request $request){
        // sleep(3);
        DB::beginTransaction();

        try {
            // $validator      = validator(
            //     $request->all(),
            //     [
            //         'id_kuesioner'              => 'required',
            //         'id_template_pertanyaan'    => 'required',
            //         'id_template_pilihan'       => 'required',
            //     ]
            // );
    
            // if(count($validator->errors())){
            //     return response()->json([
            //         "message"=>"validasi tidak valid",
            //         "validation"=>$validator->errors()->toArray(),
            //         "trace"=>null
            //     ], 400);
            // } 
    
            if($request->event=="add"){
                $bankSoal = BankSoal::findOrFail($request->id_bank_soal);
                $bankSoal->rule = json_decode($bankSoal->rule, true);

                $start = $bankSoal->rule['generate']['start'];
                $end = $bankSoal->rule['generate']['end'];

                $kolom = match($request->peruntukan){
                    'mahasiswa'=>'npm',
                    'dosen'=>'nidn',
                    default=>'nip',
                };

                if(in_array($bankSoal['rule']['type'], ["spesific","all"]) && $bankSoal['rule']['target_type']=="npm" && (in_array("all",$bankSoal['rule']['target_list']) || in_array($request->target,$bankSoal['rule']['target_list'])) ){
                    if($bankSoal['rule']['generate']['type']=="recursive"){
                        $start = date($this->replaceDateFormatIfEndDate($bankSoal->rule['generate']['start'],"slug"));
                        $end = date($this->replaceDateFormatIfEndDate($bankSoal->rule['generate']['end'],"slug"));

                        $bankSoal['start_repair'] = $start;
                        $bankSoal['end_repair'] = $end;
                    } else if($bankSoal['rule']['generate']['type']=="once"){
                        $bankSoal['start_repair'] = $start;
                        $bankSoal['end_repair'] = $end;
                    }
                } else if(in_array($bankSoal['rule']['type'], ["spesific","all"]) && $bankSoal['rule']['target_type']=="prodi" && (in_array("all",$bankSoal['rule']['target_list']) || in_array($request->target,$bankSoal['rule']['target_list'])) ){
                    if($bankSoal['rule']['generate']['type']=="recursive"){
                        $start = date($this->replaceDateFormatIfEndDate($bankSoal->rule['generate']['start'],"slug"));
                        $end = date($this->replaceDateFormatIfEndDate($bankSoal->rule['generate']['end'],"slug"));

                        $bankSoal['start_repair'] = $start;
                        $bankSoal['end_repair'] = $end;
                    } else if($bankSoal['rule']['generate']['type']=="once"){
                        $bankSoal['start_repair'] = $start;
                        $bankSoal['end_repair'] = $end;
                    }
                } else if(in_array($bankSoal['rule']['type'], ["spesific","all"]) && $bankSoal['rule']['target_type']=="fakultas" && (in_array("all",$bankSoal['rule']['target_list']) || in_array($request->target,$bankSoal['rule']['target_list'])) ){
                    if($bankSoal['rule']['generate']['type']=="recursive"){
                        $start = date($this->replaceDateFormatIfEndDate($bankSoal->rule['generate']['start'],"slug"));
                        $end = date($this->replaceDateFormatIfEndDate($bankSoal->rule['generate']['end'],"slug"));

                        $bankSoal['start_repair'] = $start;
                        $bankSoal['end_repair'] = $end;
                    } else if($bankSoal['rule']['generate']['type']=="once"){
                        $bankSoal['start_repair'] = $start;
                        $bankSoal['end_repair'] = $end;
                    }
                } else if(in_array($bankSoal['rule']['type'], ["spesific","all"]) && $bankSoal['rule']['target_type']=="unit" && (in_array("all",$bankSoal['rule']['target_list']) || in_array($request->target,$bankSoal['rule']['target_list'])) ){
                    if($bankSoal['rule']['generate']['type']=="recursive"){
                        $start = date($this->replaceDateFormatIfEndDate($bankSoal->rule['generate']['start'],"slug"));
                        $end = date($this->replaceDateFormatIfEndDate($bankSoal->rule['generate']['end'],"slug"));

                        $bankSoal['start_repair'] = $start;
                        $bankSoal['end_repair'] = $end;
                    } else if($bankSoal['rule']['generate']['type']=="once"){
                        $bankSoal['start_repair'] = $start;
                        $bankSoal['end_repair'] = $end;
                    }
                } 

                $kuesioner = Kuesioner::where($kolom,$request?->target)
                                        ->where('id_bank_soal',$request?->id_bank_soal)
                                        ->whereBetween('tanggal',[$bankSoal['start_repair'], $bankSoal['end_repair']])
                                        ->first();

                $now = strtotime(now());
                $uStart = strtotime($bankSoal['start_repair']." 00:00:00");
                $uEnd = strtotime($bankSoal['end_repair']." 23:59:59");

                if($kuesioner==null && ($now>=$uStart || $now<=$uEnd)){
                    $kuesioner = new Kuesioner();
                    $kuesioner->$kolom = $request?->target;
                    $kuesioner->id_bank_soal = $request?->id_bank_soal;
                    $kuesioner->tanggal = date('Y-m-d');
                    $kuesioner->save();
                    DB::commit();

                    return response()->json([
                        "data"=>$kuesioner->id,
                        "message"=>"berhasil simpan data template pertanyaan",
                        "validation"=>[],
                        "trace"=>null
                    ], 200);
                }

                return response()->json([
                    "data"=>$kuesioner->id,
                    "message"=>"berhasil simpan data template pertanyaan",
                    "validation"=>[],
                    "trace"=>null
                ], 200);
            } else{
                $inputFormat = [];
                foreach (($request?->data ?? []) as $data) {
                    if (!empty($data['id_kuesioner']) && !empty($data['id_template_pertanyaan']) && !empty($data['id_template_pilihan'])) {
                        $inputFormat[] = $data['id_kuesioner'] . "#" . $data['id_template_pertanyaan'] . "#" . $data['id_template_pilihan'];
                    }
                }

                $record = KuesionerJawaban::select('*',DB::raw('concat(id_kuesioner,"#",id_template_pertanyaan,"#",id_template_jawaban) as ref'))
                                                ->where('id_kuesioner', $request->id_kuesioner)
                                                ->get();

                $recordFormat = $record->count()>0? $record->pluck('ref')->toArray():[];

                $left = array_diff($inputFormat, $recordFormat);
                $right = array_diff($recordFormat, $inputFormat);

                $insertData = [];
                foreach ($left as $l) {
                    [$id_kuesioner, $id_template_pertanyaan, $id_template_pilihan] = explode("#", $l);
                    $dataInput = collect($request?->data)
                                    ->where('id_kuesioner', $id_kuesioner)
                                    ->where('id_template_pertanyaan', $id_template_pertanyaan)
                                    ->where('id_template_jawaban', $id_template_pilihan);

                    $insertData[] = [
                        'id_kuesioner' => $id_kuesioner,
                        'id_template_pertanyaan' => $id_template_pertanyaan,
                        'id_template_jawaban' => $id_template_pilihan,
                        'freeText' => $dataInput?->freeText,
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                }

                if (!empty($insertData)) {
                    KuesionerJawaban::insert($insertData);
                }

                if (!empty($right)) {
                    KuesionerJawaban::where('id_kuesioner', $request->id_kuesioner)
                        ->whereIn(DB::raw('concat(id_kuesioner,"#",id_template_pertanyaan,"#",id_template_jawaban)'), $right)
                        ->delete();
                }
                
                DB::commit();

                return response()->json([
                    "message"=>"berhasil simpan kuesioner",
                    "validation"=>[],
                    "trace"=>[]
                ],200);
            }
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "message"=>"ups ada error",
                "validation"=>[],
                "trace"=>$th->getTrace()
            ],500);
        }
    }
}
