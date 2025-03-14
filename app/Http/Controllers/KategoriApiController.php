<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KategoriApiController extends Controller
{
    public function listKategori(Request $request)
    {
        $query = Kategori::query();

        if ($request->filled('nama_kategori')) {
            $query->where('nama_kategori', 'like', '%' . $request->nama_kategori . '%');
        }

        $Kategoris = $query->paginate(5);

        return response()->json([
            'data' => $Kategoris->items(),
            'currentPage' => $Kategoris->currentPage(),
            'total' => $Kategoris->total(),
            'lastPage' => $Kategoris->lastPage(),
        ]);
    }

    public function delete(Request $request){
        
        
        try {
            Kategori::whereIn('id',$request->id)->delete();
    
            return response()->json([
                "message"=>"berhasil hapus data kategori",
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
                    'nama_kategori' => 'required|string|max:255',
                ]
            );
    
            if(count($validator->errors())){
                return response()->json([
                    "message"=>"validasi tidak valid",
                    "validation"=>$validator->errors()->toArray(),
                    "trace"=>null
                ], 400);
            } 
    
            $kategori = new Kategori();
            $kategori->nama_kategori = $request->nama_kategori;
            $kategori->save();
    
            return response()->json([
                "message"=>"berhasil simpan data kategori",
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
                    'id' => 'required',
                    'nama_kategori' => 'required|string|max:255',
                ]
            );
    
            if(count($validator->errors())){
                return response()->json([
                    "message"=>"validasi tidak valid",
                    "validation"=>$validator->errors()->toArray(),
                    "trace"=>null
                ], 400);
            } 
    
    
            $kategori = Kategori::findOrFail($request->id);
            $kategori->nama_kategori = $request->nama_kategori;
            $kategori->save();
    
            return response()->json([
                "message"=>"berhasil simpan data kategori",
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
