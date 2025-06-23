<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\Prodi;
use App\Models\TemplatePertanyaan;
use App\Models\TemplatePilihan;
use Carbon\Exceptions\InvalidFormatException;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BankSoalApiController extends Controller
{
    public function listBankSoal(Request $request)
    {
        $query = BankSoal::query()->where('hide', 0);

        if ($request->filled('judul')) {
            $query->where('judul', 'like', '%' . $request->judul . '%');
        }

        if ($request->filled('status') && $request->get('status') != "Semua") {
            $query->where('status', $request->status);
        }

        $bankSoals = $query->paginate(5);

        $bankSoals->getCollection()->transform(function($item) {
            $rule = json_decode($item->rule, true) ?? [];
            if(isset($rule["generate"]["start"])){
                $rule["generate"]["start"] = $rule["generate"]["start"];
            }
            if(isset($rule["generate"]["end"])){
                $rule["generate"]["end"] = $rule["generate"]["end"];
            }

            if(isset($rule["target_type"]) && $rule["target_type"]=="prodi"){
                $target_list = Prodi::select(
                    DB::raw('
                    concat(
                        `nama_prodi`, 
                        " (",
                        (
                        case 
                            when kode_jenjang = "C" then "S1"
                            when kode_jenjang = "B" then "S2"
                            when kode_jenjang = "A" then "S3"
                            when kode_jenjang = "E" then "D3"
                            when kode_jenjang = "D" then "D4"
                            when kode_jenjang = "J" then "Profesi"
                            else "?"
                        end
                        ),
                        ")"
                    ) as text')
                )
                ->whereIn('kode_prodi',$rule["target_list"])
                ->get()
                ->pluck('text')
                ->toArray();

                $number = 3;
                $rule["target_list"] = count($target_list)>$number? array_merge(array_slice($target_list, 0, $number), ["+".(count($target_list)-$number)." prodi"]):$target_list;
                $rule["target_list_all"] = count($target_list)>0? $target_list:$rule["target_list"];
            } 

            $item->rule = $rule;
            return $item;
        });

        return response()->json([
            'data' => $bankSoals->getCollection(),
            'currentPage' => $bankSoals->currentPage(),
            'total' => $bankSoals->total(),
            'lastPage' => $bankSoals->lastPage(),
        ]);
    }


    public function status($id,$status){
        try {
            $bankSoal = BankSoal::findOrFail($id);
            $bankSoal->status = $status;
            $bankSoal->save();
    
            return response()->json([
                "message"=>"berhasil ubah status template kuesioner",
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
    public function delete(Request $request){
        
        
        try {
            BankSoal::whereIn('id',$request->id)->delete();
    
            return response()->json([
                "message"=>"berhasil hapus data templte kuesioner",
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
        try {
            $validator      = validator(
                $request->all(),
                [
                    'judul' => 'required|string|max:255',
                ]
            );
    
            if(count($validator->errors())){
                return response()->json([
                    "message"=>"request tidak valid",
                    "validation"=>$validator->errors()->toArray(),
                    "trace"=>null
                ], 400);
            } 
    
            $bankSoal = new BankSoal();
            $bankSoal->judul = $request->judul;
            $bankSoal->status = 'active';
            $bankSoal->createdBy = "admin";
            $bankSoal->branch = 0;
            $bankSoal->save();
    
            return response()->json([
                "message"=>"berhasil simpan data templte kuesioner",
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
    public function update(Request $request){
        try {
            $validator      = validator(
                $request->all(),
                [
                    'judul' => 'required|string|max:255',
                    'peruntukan' => 'required|string|max:255',
                    'peruntukan' => 'required|string|max:255',
                ]
            );
    
            if(count($validator->errors())){
                return response()->json([
                    "message"=>"request tidak valid",
                    "validation"=>$validator->errors()->toArray(),
                    "trace"=>null
                ], 400);
            } 
    
    
            $bankSoal = BankSoal::findOrFail($request->id);
            $bankSoal->judul = $request->judul;
            $bankSoal->peruntukan = $request->peruntukan;
            if(!empty($request->deskripsi))
                $bankSoal->deskripsi = $request->deskripsi;
            if(!empty($request->rule))
                $bankSoal->rule = $request->rule;
            if(!empty($request->content))
                $bankSoal->content = htmlspecialchars($request->content);

            $bankSoal->save();
    
            return response()->json([
                "message"=>"berhasil simpan data templte kuesioner",
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
    public function copy(Request $request)
    {
        
        DB::beginTransaction();
        try {
            // Validasi input
            $validator = validator(
                $request->all(),
                [
                    'id' => 'required',
                    'judul' => 'required|string|max:255',
                ]
            );

            if(count($validator->errors())) {
                return response()->json([
                    "message" => "request tidak valid",
                    "validation" => $validator->errors()->toArray(),
                    "trace" => null
                ], 400);
            } 

            $bankSoal = BankSoal::findOrFail($request->id);
            $newBankSoal = $bankSoal->replicate();
            $newBankSoal->judul = $request->judul; // Judul baru bisa diubah sesuai request
            $newBankSoal->save();

            // Menyalin template pertanyaan
            $templatePertanyaan = TemplatePertanyaan::where('id_bank_soal', $request->id)
                                                    ->get(); 

            foreach ($templatePertanyaan as $template) {
                // Menyalin setiap template pertanyaan
                $newTemplate = $template->replicate();
                $newTemplate->id_bank_soal = $newBankSoal->id;  // Menetapkan id bank soal baru
                $newTemplate->save();

                // Menyalin pilihan jawaban terkait
                $templatePilihan = TemplatePilihan::where('id_template_soal', $template->id)
                                                ->get();

                foreach ($templatePilihan as $pilihan) {
                    $newPilihan = $pilihan->replicate();
                    $newPilihan->id_template_soal = $newTemplate->id;  // Menetapkan id template soal baru
                    $newPilihan->save();
                }
            }

            DB::commit();

            return response()->json([
                "message" => "berhasil duplikat data template kuesioner",
                "validation" => [],
                "trace" => null
            ], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "message" => "ups ada error",
                "validation" => [],
                "trace" => $th->getTrace()
            ], 500);
        }
    }
    public function branch(Request $request)
    {
        
        DB::beginTransaction();
        try {
            // Validasi input
            $validator = validator(
                $request->all(),
                [
                    'id' => 'required',
                    'target' => 'required',
                    'level' => 'required',
                ]
            );

            if(count($validator->errors())) {
                return response()->json([
                    "message" => "request tidak valid",
                    "validation" => $validator->errors()->toArray(),
                    "trace" => null
                ], 400);
            } 

            if(!is_array($request->target) || count($request->target)==0){
                return response()->json([
                    "message" => "data target kosong",
                    "validation" => [],
                    "trace" => null
                ], 500);
            }
            if(empty($request->leven)!="fakultas"){
                return response()->json([
                    "message" => "perintah branch di tolak karena saat ini pengguna selain fakultas",
                    "validation" => [],
                    "trace" => null
                ], 500);
            }

            $bankSoal = BankSoal::findOrFail($request->id);            
            
            $newBankSoal = $bankSoal->replicate();
            $newRule = json_decode($newBankSoal->rule, true);
            if($newRule["target_type"]!="prodi"){
                return response()->json([
                    "message" => "perintah branch di tolak karena target tipe bukan prodi",
                    "validation" => [],
                    "trace" => null
                ], 500);
            }
            $newRule["type"] = 'spesific';
            $newRule["target_list"] = $request->target;
            $newBankSoal->rule = json_encode($newRule);
            $newBankSoal->createdBy = "fakultas";
            $newBankSoal->branch = $bankSoal->id;
            $newBankSoal->save();

            $oldRule = json_decode($bankSoal->rule, true);
            if($request->level=="fakultas"){
                // $listKode = Prodi::select('kode_fak')->whereIn("kode_prodi",$request->target)->get()->pluck('kode_fak')->toArray();
                // $listKode = array_values(array_unique($listKode));
                $listTargetAvailable = Prodi::select('kode_prodi')->whereNotIn('kode_prodi', $request->target)->get()->pluck('kode_prodi')->toArray();

                $oldRule["target_list"] = $listTargetAvailable;
                $oldRule["type"] = 'spesific';
            } else{
                $oldRule["target_list"] = [];
            }
            
            $bankSoal->rule = json_encode($oldRule);
            $bankSoal->save();

            // Menyalin template pertanyaan
            $templatePertanyaan = TemplatePertanyaan::where('id_bank_soal', $request->id)
                                                    ->get(); 

            foreach ($templatePertanyaan as $template) {
                // Menyalin setiap template pertanyaan
                $newTemplate = $template->replicate();
                $newTemplate->id_bank_soal = $newBankSoal->id;  // Menetapkan id bank soal baru
                $newTemplate->save();

                // Menyalin pilihan jawaban terkait
                $templatePilihan = TemplatePilihan::where('id_template_soal', $template->id)
                                                ->get();

                foreach ($templatePilihan as $pilihan) {
                    $newPilihan = $pilihan->replicate();
                    $newPilihan->id_template_soal = $newTemplate->id;  // Menetapkan id template soal baru
                    $newPilihan->save();
                }
            }

            DB::commit();

            return response()->json([
                "message" => "berhasil duplikat data template kuesioner",
                "validation" => [],
                "trace" => null
            ], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "message" => "ups ada error",
                "validation" => [],
                "trace" => $th->getTrace()
            ], 500);
        }
    }
}
