<?php

namespace App\Http\Controllers;

use App\Models\SubKategori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SubKategoriApiController extends Controller
{
    public function listSubKategori(Request $request)
    {
        $query = SubKategori::query()->where('id_kategori',$request->id_kategori);

        if ($request->filled('nama_sub')) {
            $query->where('nama_sub', 'like', '%' . $request->nama_sub . '%');
        }

        $SubKategoris = $query->paginate(5);

        return response()->json([
            'data' => $SubKategoris->items(),
            'currentPage' => $SubKategoris->currentPage(),
            'total' => $SubKategoris->total(),
            'lastPage' => $SubKategoris->lastPage(),
        ]);
    }

    public function delete(Request $request){
        
        
        try {
            SubKategori::whereIn('id',$request->id)->delete();
    
            return response()->json([
                "message"=>"berhasil hapus data Subkategori",
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
                    'id_kategori' => 'required',
                    'nama_sub' => 'required|string|max:255',
                ]
            );
    
            if(count($validator->errors())){
                return response()->json([
                    "message"=>"request tidak valid",
                    "validation"=>$validator->errors()->toArray(),
                    "trace"=>null
                ], 400);
            } 
    
            $Subkategori = new SubKategori();
            $Subkategori->id_kategori = $request->id_kategori;
            $Subkategori->nama_sub = $request->nama_sub;
            $Subkategori->save();
    
            return response()->json([
                "message"=>"berhasil simpan data Subkategori",
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
                    'id_kategori' => 'required',
                    'nama_sub' => 'required|string|max:255',
                ]
            );
    
            if(count($validator->errors())){
                return response()->json([
                    "message"=>"request tidak valid",
                    "validation"=>$validator->errors()->toArray(),
                    "trace"=>null
                ], 400);
            } 
    
    
            $Subkategori = SubKategori::findOrFail($request->id);
            $Subkategori->id_kategori = $request->id_kategori;
            $Subkategori->nama_sub = $request->nama_sub;
            $Subkategori->save();
    
            return response()->json([
                "message"=>"berhasil simpan data Subkategori",
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
