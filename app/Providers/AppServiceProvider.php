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
        
        // if (config('DEPLOY') === 'prod') {
            URL::forceScheme('https');
        // }

        Inertia::share([
            'csrf_token' => function () {
                return csrf_token();
            },
        ]);
    }
}
