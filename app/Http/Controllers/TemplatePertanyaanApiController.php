<?php

namespace App\Http\Controllers;

use App\Models\TemplatePertanyaan;
use App\Models\TemplatePilihan;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TemplatePertanyaanApiController extends Controller
{
    public function listTemplatePertanyaan(Request $request)
    {
        sleep(3);

        $query = TemplatePertanyaan::select('template_pertanyaan.*','kategori.nama_kategori','sub_kategori.nama_sub')
                                    ->leftJoin('kategori','template_pertanyaan.id_kategori','=','kategori.id')
                                    ->leftJoin('sub_kategori','template_pertanyaan.id_sub_kategori','=','sub_kategori.id');

        if($request->filled('id_bank_soal')){
            $query = $query->where('id_bank_soal', $request->id_bank_soal);
        }

        // Apply existing filters
        if ($request->filled('pertanyaan')) {
            $query->where('pertanyaan', 'like', '%' . $request->pertanyaan . '%');
        }
        if ($request->filled('kategori')) {
            $query->where('kategori.nama_kategori', 'like', '%' . $request->kategori . '%');
        }
        if ($request->filled('sub_Kategori')) {
            $query->where('sub_kategori.nama_sub', 'like', '%' . $request->sub_Kategori . '%');
        }

        // Paginate the result
        $TemplatePertanyaans = $query->paginate(5);

        // Return the data as JSON
        return response()->json([
            'data' => $TemplatePertanyaans->items(),
            'currentPage' => $TemplatePertanyaans->currentPage(),
            'total' => $TemplatePertanyaans->total(),
            'lastPage' => $TemplatePertanyaans->lastPage(),
        ]);
    }
    public function delete(Request $request){
        sleep(3);
        
        try {
            TemplatePertanyaan::whereIn('id',$request->id)->delete();
    
            return response()->json([
                "current_id"=>$request->id,
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
        sleep(3);

        DB::beginTransaction();
        try {
            $validator      = validator(
                $request->all(),
                [
                    'id_bank_soal'  => 'required',
                    'pertanyaan'    => 'required',
                    'jenis_pilihan' => 'required',
                    'bobot'         => 'required',
                    'kategori'      => 'required',
                ]
            );
    
            if(count($validator->errors())){
                return response()->json([
                    "message"=>"validasi tidak valid",
                    "validation"=>$validator->errors()->toArray(),
                    "trace"=>null
                ], 400);
            }
            
            $nowJenisPilihan = $request->jenis_pilihan;
    
            if(empty($request->id)){
                $TemplatePertanyaan = new TemplatePertanyaan();
            } else{
                $TemplatePertanyaan = TemplatePertanyaan::findOrFail($request->id);
            }

            $TemplatePertanyaan->id_bank_soal = $request->id_bank_soal;
            $TemplatePertanyaan->pertanyaan = $request->pertanyaan;
            $TemplatePertanyaan->jenis_pilihan = $request->jenis_pilihan;
            $TemplatePertanyaan->bobot = $request->bobot;
            $TemplatePertanyaan->id_kategori = $request->kategori;
            if(!empty($request->subKategori)){
                $TemplatePertanyaan->id_sub_kategori = $request->subKategori;   
            }
            $TemplatePertanyaan->save();

            if ($request->jenis_pilihan === "rating5") {
                $listJawabanLama = $TemplatePertanyaan?->id 
                    ? TemplatePilihan::where('id_template_soal', $TemplatePertanyaan->id)->get()
                    : collect([]);
            
                if ($listJawabanLama->isEmpty()) {
                    $data = array_map(fn($i) => [
                        'id_template_soal' => $TemplatePertanyaan?->id, 
                        'jawaban' => $i,
                        'nilai' => $i,
                        'created_at' => now(),
                        'updated_at' => now()
                    ], range(1, 5));
            
                    TemplatePilihan::insert($data);
                } else {
                    foreach ($listJawabanLama as $index => $item) {
                        $val = $index + 1;
                    
                        if ($val <= 5) {
                            $item->update([
                                'jawaban' => $val,
                                'nilai' => $val
                            ]);
                        } else {
                            $item->delete();
                        }
                    }
                }
            }

            DB::commit();
    
            return response()->json([
                "current_id"=>$TemplatePertanyaan?->id,
                "message"=>"berhasil simpan data template pertanyaan",
                "validation"=>[],
                "trace"=>null
            ], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "message"=>"ups ada error",
                "validation"=>[],
                "messageTrace"=>$th->getMessage(),
                "trace"=>$th->getTrace(),
            ],500);
        }
    }

    public function listTemplatePilihan($id_template_soal, Request $request)
    {
        sleep(3);

        $query = TemplatePilihan::query();

        $query->where('id_template_soal', $id_template_soal);

        if($request->type=="tabel"){
            // Apply existing filters
            if ($request->filled('pertanyaan')) {
                $query->where('pertanyaan', 'like', '%' . $request->pertanyaan . '%');
            }

            if ($request->filled('tipe') && $request->get('tipe')!="Semua") {
                $query->where('tipe', $request->tipe);
            }

            // Paginate the result
            $TemplatePertanyaans = $query->paginate(5);

            // Return the data as JSON
            return response()->json([
                'data' => $TemplatePertanyaans->items(),
                'currentPage' => $TemplatePertanyaans->currentPage(),
                'total' => $TemplatePertanyaans->total(),
                'lastPage' => $TemplatePertanyaans->lastPage(),
            ]);
        }

        return $query->get();
    }
    public function savePilihan(Request $request){
        sleep(3);

        try {
            $validator      = validator(
                $request->all(),
                [
                    'id_template_soal'  => 'required',
                    'jawaban'           => 'required_with:id',
                    'nilai'             => 'required_with:id',
                ]
            );
    
            if(count($validator->errors())){
                return response()->json([
                    "message"=>"validasi tidak valid",
                    "validation"=>$validator->errors()->toArray(),
                    "trace"=>null
                ], 400);
            } 
    
            if(empty($request->id)){
                $TemplatePilihan = new TemplatePilihan();
            } else{
                $TemplatePilihan = TemplatePilihan::findOrFail($request->id);
            }
            $TemplatePilihan->id_template_soal = $request->id_template_soal;
            if(!empty($request->id))
                $TemplatePilihan->jawaban = $request->jawaban;
            if(!empty($request->id))
                $TemplatePilihan->nilai = $request->nilai;
            $TemplatePilihan->save();
    
            return response()->json([
                "message"=>"berhasil simpan data template pilihan",
                "validation"=>[],
                "trace"=>null
            ], 200);
        } catch (\Throwable $th) {
            throw $th;
            return response()->json([
                "message"=>"ups ada error",
                "validation"=>[],
                "trace"=>$th->getTrace()
            ],500);
        }
    }
    public function deletePilihan(Request $request){
        sleep(3);
        
        try {
            TemplatePilihan::where('id',$request->id)->delete();
    
            return response()->json([
                "message"=>"berhasil hapus data template pilihan",
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
}
