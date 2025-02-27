<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class DashboardController extends Controller
{
    // function __construct()
    // {
    //     parent::__construct();
    // }

    public function index()
    {
        return Inertia::render('Dashboard', ['level'=>session()->get('level')]);
    }
}
