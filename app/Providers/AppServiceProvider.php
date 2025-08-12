<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
        
        // if(env('DEPLOY','dev')=='prod'){
            \Illuminate\Support\Facades\URL::forceScheme('https');
        // }

        Inertia::share([
            'csrf_token' => function () {
                return csrf_token();
            },
        ]);
    }
}
