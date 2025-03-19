<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSession
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $x1 = array_keys(session()->all());
        $x2 = [
            'id',
            'nip',
            'nidn',
            'npm',
            'nama',
            'fakultas',
            'prodi',
            'unit',
            'level',
        ];

        $rule1 = count(array_intersect($x1, $x2)) > 0;

        if ($rule1) {
            return $next($request);
        }
        return redirect()->route('/');
    }
}