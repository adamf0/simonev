<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
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
                    "message"=>"validasi tidak valid",
                    "validation"=>$validator->errors()->toArray(),
                    "trace"=>null
                ], 400);
            } 
    
            $bankSoal = new BankSoal();
            $bankSoal->judul = $request->judul;
            $bankSoal->status = 'active';
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
                ]
            );
    
            if(count($validator->errors())){
                return response()->json([
                    "message"=>"validasi tidak valid",
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
                    "message" => "validasi tidak valid",
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
}
