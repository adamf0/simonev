<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PenggunaApiController extends Controller
{
    public function listPengguna(Request $request)
    {
        $query = User::select('id','name','username','level');

        if ($request->filled('nama')) {
            $query->where('name', 'like', '%' . $request->nama . '%');
        }

        if ($request->filled('level') && $request->get('level') != "Semua") {
            $query->where('level', $request->level);
        }

        $penggunas = $query->paginate(5);

        return response()->json([
            'data' => $penggunas->items(),
            'currentPage' => $penggunas->currentPage(),
            'total' => $penggunas->total(),
            'lastPage' => $penggunas->lastPage(),
        ]);
    }


    public function delete(Request $request){
        
        
        try {
            User::whereIn('id',$request->id)->delete();
    
            return response()->json([
                "message"=>"berhasil hapus data pengguna",
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
                    'nama' => 'required|max:255',
                    'password' => 'required|max:255',
                    'level' => 'required|max:255',
                    'fakultas' => 'required_if:lavel,fakultas',
                ]
            );
    
            if(count($validator->errors())){
                return response()->json([
                    "message"=>"request tidak valid",
                    "validation"=>$validator->errors()->toArray(),
                    "trace"=>null
                ], 400);
            } 
    
            $pengguna = new User();
            $pengguna->name = $request->nama;
            $pengguna->username = $request->username;
            $pengguna->password_plain = $request->password;
            $pengguna->level = $request->level;
            $pengguna->fakultas = $request->level=="admin"? null:$request->fakultas;
            $pengguna->save();
    
            return response()->json([
                "message"=>"berhasil simpan data pengguna",
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
                    'nama' => 'required|max:255',
                    'level' => 'required|max:255',
                    'fakultas' => 'required_if:lavel,fakultas',
                ]
            );
    
            if(count($validator->errors())){
                return response()->json([
                    "message"=>"request tidak valid",
                    "validation"=>$validator->errors()->toArray(),
                    "trace"=>null
                ], 400);
            } 
    
    
            $pengguna = User::find($request->id);
            $pengguna->name = $request->nama;
            $pengguna->username = $request->username;
            if(!empty($request->password)){
            $pengguna->password_plain = $request->password;
            }
            $pengguna->level = $request->level;
            $pengguna->fakultas = $request->level=="admin"? null:$request->fakultas;
            $pengguna->save();
    
            return response()->json([
                "message"=>"berhasil simpan data pengguna",
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
