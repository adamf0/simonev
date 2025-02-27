<?php

namespace App\Http\Controllers;

use App\Models\AkunSimak;
use App\Models\AkunSimpeg;
use App\Models\User;
use Auth;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Login', []);
    }

    function loginSimak($username, $password){
        $akunSimak = AkunSimak::with([
            'Dosen',
            'Dosen.EPribadi',
            'Dosen.EPribadi.Payroll'
        ])
        ->where('username',$username)
        ->get()
        ->filter(fn($item)=> sha1(md5($password))==$item->password)
        ->values();

        if($akunSimak->count()>1){
            throw new Exception("login gagal karena akun ditemukan lebih dari 1");
        }

        $akunSimak = $akunSimak->first();
        if($akunSimak==null){
            return null;   
        }
        if($akunSimak->aktif!="Y"){
            throw new Exception("akun sudah tidak aktif");
        }
        $level = strtolower($akunSimak->level);
        if(!in_array("",["dosen","mahasiswa"])){
            throw new Exception("selain dosen dan mahasiswa tidak diizinkan masuk");
        }

        return (object)[
            "id"=>$akunSimak->userid,
            "nip"=>null,
            "nidn"=>$akunSimak->Dosen?->NIDN,
            "npm"=>null,
            "nama"=>$akunSimak->nama,
            "fakultas"=>strtolower($akunSimak->Dosen?->Fakultas?->nama_fakultas),
            "prodi"=>strtolower($akunSimak->Dosen?->Prodi?->nama_prodi),
            "unit"=>null,
            "level"=>$level,
        ];
    }

    public function loginSimpeg($username,$password){
        $akunSimpeg = AkunSimpeg::with([
                                'Pengangkatan',
                                'PayrollPegawai',
                                'NPribadi'
                            ])
                            ->where('username',$username)
                            ->get()
                            ->filter(function($item) use($password){
                                return sha1($password)==$item->password;
                            })
                            ->values();

        if($akunSimpeg->count()>1){
            throw new Exception("login gagal karena akun ditemukan lebih dari 1");
        }

        $akunSimpeg = $akunSimpeg->first();
        if($akunSimpeg==null){
            return null;
        }

        return (object)[
            "id"=>$akunSimpeg->id,
            "nip"=>$akunSimpeg->NPribadi?->nip,
            "nidn"=>null,
            "npm"=>null,
            "nama"=>$akunSimpeg->NPribadi?->nama,
            "fakultas"=>null,
            "prodi"=>null,
            "unit"=>rtrim(str_replace("f.", "fakultas", strtolower($akunSimpeg->Pengangkatan?->unit_kerja))),
            "level"=>'tendik',
        ];
    }

    public function login(Request $request)
    {
        try {
            $validator      = validator($request->all(), [
                'username' => ['required','min:3'],
                'password' => ['required'],
            ]);

            if(count($validator->errors())){
                return redirect('/')->withInput()->withErrors($validator->errors()->toArray());    
            }

            $akun = User::where("username", $request->username)->where("password_plain", $request->password)->first();

            if($akun==null){
                $akunSimak = $this->loginSimak($request->username, $request->password);
                if($akunSimak==null){
                    $akunSimpeg = $this->loginSimpeg($request->username, $request->password);
                    if($akunSimpeg==null){
                        throw new Exception("akun tidak ditemukan");
                    } else{
                        $request->session()->regenerate();
                        $request->session()->put("id",$akunSimpeg?->id);
                        $request->session()->put("nip",$akunSimpeg?->nip);
                        $request->session()->put("nidn",$akunSimpeg?->nidn);
                        $request->session()->put("npm",$akunSimpeg?->npm);
                        $request->session()->put("nama",$akunSimpeg?->nama);
                        $request->session()->put("fakultas",$akunSimpeg?->fakultas);
                        $request->session()->put("prodi",$akunSimpeg?->prodi);
                        $request->session()->put("unit",$akunSimpeg?->unit);
                        $request->session()->put("level",$akunSimpeg?->level);
                    }
                } else{
                    $request->session()->regenerate();
                    $request->session()->put("id",$akunSimak?->id);
                    $request->session()->put("nip",$akunSimak?->nip);
                    $request->session()->put("nidn",$akunSimak?->nidn);
                    $request->session()->put("npm",$akunSimak?->npm);
                    $request->session()->put("nama",$akunSimak?->nama);
                    $request->session()->put("fakultas",$akunSimak?->fakultas);
                    $request->session()->put("prodi",$akunSimak?->prodi);
                    $request->session()->put("unit",$akunSimak?->unit);
                    $request->session()->put("level",$akunSimak?->level);
                }
    
                return redirect()->route('kuesioner');
            } else{

                $request->session()->regenerate();
                $request->session()->put("id",$akun?->id);
                $request->session()->put("nip",null);
                $request->session()->put("nidn",null);
                $request->session()->put("npm",null);
                $request->session()->put("nama",$akun?->name);
                $request->session()->put("fakultas",$akun->fakultas);
                $request->session()->put("prodi",null);
                $request->session()->put("unit",null);
                $request->session()->put("level",$akun?->level);

                return redirect()->route('dashboard');
            }
        } catch (Exception $e) {
            // $request->session()->regenerate();
            //     $request->session()->put("id",0);
            //     $request->session()->put("nip",null);
            //     $request->session()->put("nidn",null);
            //     $request->session()->put("npm","065117251");
            //     $request->session()->put("nama","adam");
            //     $request->session()->put("fakultas","mipa");
            //     $request->session()->put("prodi","ilkom");
            //     $request->session()->put("unit",null);
            //     $request->session()->put("level",'mahasiswa');
            //     return redirect()->route('kuesioner');

            return redirect('/')->with('pesan', $e->getMessage());
        }
    }

    public function logout(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
