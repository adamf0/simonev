<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\Kuesioner;
use App\Models\KuesionerJawaban;
use Carbon\Exceptions\InvalidFormatException;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KuesionerApiController extends Controller
{
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
    
    public function listKuesioner(Request $request)
    {
        $kolom = match($request->peruntukan){
            "dosen"=>"nidn",
            "tendik"=>"nip",
            "mahasiswa"=>"npm",
            default=>"all",
        };

        $results = DB::table('kuesioner')
                        ->selectRaw(
                            "
                            kuesioner.*, 
                            bank_soal.id as id_bank_soal,
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

        $bank_soal = DB::table("bank_soal");

        if ($request->filled("bank_soal")) {
            $results = $results->where('bank_soal.judul', $request->bank_soal);
        }

        if ($request->filled("peruntukan")) {
            $results = $results->whereNotNull("kuesioner.$kolom");
        }

        if ($request->filled("data")) {
            $results = $results->where("kuesioner.$kolom", $request->data);

            $bank_soal = $bank_soal->selectRaw("
                id as id_bank_soal,
                CASE WHEN ? = 'npm' THEN ? ELSE NULL END AS npm,
                CASE WHEN ? = 'nidn' THEN ? ELSE NULL END AS nidn,
                CASE WHEN ? = 'nip' THEN ? ELSE NULL END AS nip,
                DATE_FORMAT(now(),'%d/%m/%Y') as tanggal,
                bank_soal.judul,
                bank_soal.deskripsi,
                bank_soal.rule,
                CASE 
                    WHEN ? = 'npm' THEN 'mahasiswa'
                    WHEN ? = 'nidn' THEN 'dosen'
                    WHEN ? = 'nip' THEN 'tendik'
                    ELSE NULL
                END AS peruntukan
            ", [
                $kolom, $request->data,
                $kolom, $request->data,
                $kolom, $request->data,
                $kolom, $kolom, $kolom
            ])
            ->where(fn($q) => 
                $q->where(function($query) use ($request, $kolom) {
                    $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(rule, '$.target_type')) = ?", [$kolom])
                        ->where(function($sub) use ($request) {
                            $sub->whereRaw("JSON_CONTAINS(JSON_EXTRACT(rule, '$.target_list'), JSON_QUOTE(?))", [$request->data])
                                ->orWhereRaw("JSON_CONTAINS(JSON_EXTRACT(rule, '$.target_list'), '\"all\"')");
                        });
                })
                ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(rule, '$.target_type')) = 'all'")
            );
        }

        $results = $results->join('bank_soal', 'kuesioner.id_bank_soal', '=', 'bank_soal.id')
            ->orderByDesc('kuesioner.tanggal')
            ->get();

        $results = $results->transform(function ($item) use($request){
                            $yearEntry = date('Y', strtotime($item->tanggal));
                            $item->rule = json_decode($item->rule, true);

                            $now = date('Y-m-d');
                            $start = $item->rule['generate']['start'];
                            $end = $item->rule['generate']['end'];
                            $item->open_edit = strtotime($now) >= strtotime($start." 00:00:00") && strtotime($now) <= strtotime($end." 23:59:59");

                            if($item->rule['type']=="spesific" && $item->rule['target_type']=="npm" && (in_array("all",$item->rule['target_list']) || in_array($request->data,$item->rule['target_list'])) ){
                                if($item->rule['generate']['type']=="recursive"){
                                    $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                    $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));
                                    
                                    $item->start_repair = $start;
                                    $item->end_repair = $end;
                                } else if($item->rule['generate']['type']=="once"){
                                    $item->start_repair = $item->rule['generate']['start'];
                                    $item->end_repair = $item->rule['generate']['end'];
                                }
                            } else if($item->rule['type']=="spesific" && $item->rule['target_type']=="prodi" && (in_array("all",$item->rule['target_list']) || in_array($request->data,$item->rule['target_list'])) ){
                                if($item->rule['generate']['type']=="recursive"){
                                    $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                    $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));

                                    $item->start_repair = $start;
                                    $item->end_repair = $end;
                                } else if($item->rule['generate']['type']=="once"){
                                    $item->start_repair = $item->rule['generate']['start'];
                                    $item->end_repair = $item->rule['generate']['end'];
                                }
                            } else if($item->rule['type']=="spesific" && $item->rule['target_type']=="fakultas" && (in_array("all",$item->rule['target_list']) || in_array($request->data,$item->rule['target_list'])) ){
                                if($item->rule['generate']['type']=="recursive"){
                                    $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                    $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));

                                    $item->start_repair = $start;
                                    $item->end_repair = $end;
                                } else if($item->rule['generate']['type']=="once"){
                                    $item->start_repair = $item->rule['generate']['start'];
                                    $item->end_repair = $item->rule['generate']['end'];
                                }
                            } else if($item->rule['type']=="spesific" && $item->rule['target_type']=="unit" && (in_array("all",$item->rule['target_list']) || in_array($request->data,$item->rule['target_list'])) ){
                                if($item->rule['generate']['type']=="recursive"){
                                    $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                    $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));

                                    $item->start_repair = $start;
                                    $item->end_repair = $end;
                                } else if($item->rule['generate']['type']=="once"){
                                    $item->start_repair = $item->rule['generate']['start'];
                                    $item->end_repair = $item->rule['generate']['end'];
                                }
                            } else if($item->rule['type']=="all"){
                                if($item->rule['generate']['type']=="recursive"){
                                    $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                    $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));

                                    $item->start_repair = $start;
                                    $item->end_repair = $end;
                                } else if($item->rule['generate']['type']=="once"){
                                    $item->start_repair = $item->rule['generate']['start'];
                                    $item->end_repair = $item->rule['generate']['end'];
                                }
                            }

                            $item->hasCreated = 1;
                            
                            return $item;
                        })
                        ->filter(fn($item)=> date('Y', strtotime($item->tanggal)) || strtotime(now()) >= strtotime($item->start_repair." 00:00:00") && strtotime(now()) <= strtotime($item->end_repair." 23:59:59"))
                        ->values();

        $results2 = $bank_soal->get()
                    ->transform(function ($item) use($request){
                            $yearEntry = date('Y');
                            $item->rule = json_decode($item->rule, true);

                            $now = date('Y-m-d');
                            $start = $item->rule['generate']['start'];
                            $end = $item->rule['generate']['end'];
                            $item->open_edit = strtotime($now) >= strtotime($start." 00:00:00") && strtotime($now) <= strtotime($end." 23:59:59");

                            if($item->rule['type']=="spesific" && $item->rule['target_type']=="npm" && (in_array("all",$item->rule['target_list']) || in_array($request->data,$item->rule['target_list'])) ){
                                if($item->rule['generate']['type']=="recursive"){
                                    $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                    $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));
                                    
                                    $item->start_repair = $start;
                                    $item->end_repair = $end;
                                } else if($item->rule['generate']['type']=="once"){
                                    $item->start_repair = $item->rule['generate']['start'];
                                    $item->end_repair = $item->rule['generate']['end'];
                                }
                            } else if($item->rule['type']=="spesific" && $item->rule['target_type']=="prodi" && (in_array("all",$item->rule['target_list']) || in_array($request->data,$item->rule['target_list'])) ){
                                if($item->rule['generate']['type']=="recursive"){
                                    $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                    $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));

                                    $item->start_repair = $start;
                                    $item->end_repair = $end;
                                } else if($item->rule['generate']['type']=="once"){
                                    $item->start_repair = $item->rule['generate']['start'];
                                    $item->end_repair = $item->rule['generate']['end'];
                                }
                            } else if($item->rule['type']=="spesific" && $item->rule['target_type']=="fakultas" && (in_array("all",$item->rule['target_list']) || in_array($request->data,$item->rule['target_list'])) ){
                                if($item->rule['generate']['type']=="recursive"){
                                    $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                    $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));

                                    $item->start_repair = $start;
                                    $item->end_repair = $end;
                                } else if($item->rule['generate']['type']=="once"){
                                    $item->start_repair = $item->rule['generate']['start'];
                                    $item->end_repair = $item->rule['generate']['end'];
                                }
                            } else if($item->rule['type']=="spesific" && $item->rule['target_type']=="unit" && (in_array("all",$item->rule['target_list']) || in_array($request->data,$item->rule['target_list'])) ){
                                if($item->rule['generate']['type']=="recursive"){
                                    $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                    $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));

                                    $item->start_repair = $start;
                                    $item->end_repair = $end;
                                } else if($item->rule['generate']['type']=="once"){
                                    $item->start_repair = $item->rule['generate']['start'];
                                    $item->end_repair = $item->rule['generate']['end'];
                                }
                            } else if($item->rule['type']=="all"){
                                if($item->rule['generate']['type']=="recursive"){
                                    $start = date($this->replaceDateFormatIfEndDate($item->rule['generate']['start'],"slug", $yearEntry));
                                    $end = date($this->replaceDateFormatIfEndDate($item->rule['generate']['end'],"slug", $yearEntry));

                                    $item->start_repair = $start;
                                    $item->end_repair = $end;
                                } else if($item->rule['generate']['type']=="once"){
                                    $item->start_repair = $item->rule['generate']['start'];
                                    $item->end_repair = $item->rule['generate']['end'];
                                }
                            }

                            $item->hasCreated = 0;
                            
                            return $item;
                    })
                    ->filter(fn($item) =>
                        strtotime(now()) >= strtotime($item->start_repair." 00:00:00") &&
                        strtotime(now()) <= strtotime($item->end_repair." 23:59:59")
                    )
                    ->values();

        $resource = $results2->merge($results)->values();
        $perPage = 5;
        $currentPage = $request?->page ?? 1;
        $currentPage = $currentPage <= 0? 1:$currentPage;

        $currentPageResults = $resource->forPage($currentPage, $perPage);

        return response()->json([
            'data' => $currentPageResults,
            'currentPage' => (int) $currentPage,
            'total' => $resource->count(),
            'lastPage' => ceil($resource->count() / $perPage),
        ]);
    }
    public function delete(Request $request){
        
        
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
        // 
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
            //         "message"=>"request tidak valid",
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
                } else if(in_array($bankSoal['rule']['type'], ["spesific","all"]) && $bankSoal['rule']['target_type']==null && (in_array("all",$bankSoal['rule']['target_list']) || in_array($request->target,$bankSoal['rule']['target_list'])) ){
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

                if(empty($bankSoal['start_repair']) || empty($bankSoal['end_repair'])){
                    throw new Exception("gagal medapatkan bank soal yg aktif rule");
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
                    $dataInput =collect($request->data)
                                    ->map(fn($item) => [
                                        'id_kuesioner' => (int) $item['id_kuesioner'],
                                        'id_template_pertanyaan' => (int) $item['id_template_pertanyaan'],
                                        'id_template_pilihan' => (int) $item['id_template_pilihan'],
                                        'freeText' => $item['freeText']
                                    ])
                                    ->where('id_kuesioner', (int) $id_kuesioner)
                                    ->where('id_template_pertanyaan', (int) $id_template_pertanyaan)
                                    ->where('id_template_pilihan', (int) $id_template_pilihan)
                                    ->first();

                    $insertData[] = [
                        'id_kuesioner' => $id_kuesioner,
                        'id_template_pertanyaan' => $id_template_pertanyaan,
                        'id_template_jawaban' => $id_template_pilihan,
                        'freeText' => $dataInput['freeText'],
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
                "trace"=>$th->getTrace(),
                "messagetrace"=>$th->getMessage(),
            ],500);
        }
    }
    public function ListKuesionerActive(Request $request)
    {
        $peruntukan = $request->get('level');
        $fakultas = $request->get('fakultas');
        $prodi = $request->get('prodi');
        $unit = $request->get('unit');
        $target = match($peruntukan){
            'mahasiswa'=>$request->get('npm'),
            'dosen'=>$request->get('nidn'),
            default=>$request->get('nip'),
        };

        $bankSoal = BankSoal::select('id','judul','deskripsi','peruntukan', 'rule', 'status')
                            ->where('peruntukan',$peruntukan)
                            ->where('status','active')
                            ->where('hide','0')
                            ->get()->transform(function($item){
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
        $bankSoal = $filter->filter(function($items) use($now){
            return strtotime($now) >= strtotime($items->start_repair." 00:00:00") && strtotime($now) <= strtotime($items->end_repair." 23:59:59");
        })->values();

        $bankSoal = $bankSoal->filter(function($items) use($peruntukan,$now,$target){
            $kolom = match($peruntukan){
                'mahasiswa'=>'npm',
                'dosen'=>'nidn',
                default => 'nip'
            };
            $active = strtotime($now) >= strtotime($items->start_repair." 00:00:00") || strtotime($now) <= strtotime($items->end_repair." 23:59:59");
            
            $kuesioner = Kuesioner::where('id_bank_soal',$items->id)->where($kolom, $target)->whereBetween("tanggal",[$items->start_repair,$items->end_repair])->get();
            $filtered = $active && ($kuesioner->count()==1 || $kuesioner->count()==0);

            if($kuesioner->count()>1){
                $kuesioner = "E-K1";
            } else if($kuesioner->count()==0){
                $kuesioner = "E-K0";
            } else {
                $kuesioner = $kuesioner->first()?->id;
            }
            
            $items->active_entry = $active;
            $items->kuesioner = $kuesioner;

            return $filtered;
        });
        
        return response()->json($bankSoal);
        // dd([
        //     'bankSoal'=>$bankSoal,
        //     'peruntukan'=>$peruntukan,
        //     'prodi'=>$prodi,
        //     'fakultas'=>$fakultas,
        //     'unit'=>$unit,
        //     'target'=>$target,
        //     "level"=>$request->get('level')
        // ]);
    }
}
