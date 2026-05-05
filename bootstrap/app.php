<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\XssSanitization;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Maatwebsite\Excel\ExcelServiceProvider;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        api: __DIR__ . '/../routes/api.php',
    )
    ->withProviders([
        ExcelServiceProvider::class,
    ])
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'login',
            'propagation'
        ]);
        $middleware->web(append: [
            HandleInertiaRequests::class,
            XssSanitization::class
        ]);
        $middleware->api(append: [
            XssSanitization::class
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
