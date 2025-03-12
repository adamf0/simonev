<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title>SYNC-SIMAK 1</title>
    <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        .form-select, .form-control {
            border: none;
            border-bottom: 1px solid #000000;
            border-radius: 0;
        }
        .form-select:focus, .form-control:focus {
            box-shadow: none;
            border-bottom-color: #2196f3;
        }
        .form-floating > label {
            border: 1px solid transparent;
            height: 100%;
            left: 0;
            padding: 1rem 1.4rem !important;
            pointer-events: none;
            position: absolute;
            top: 0;
            transform-origin: 0 0;
            transition: opacity 0.1s ease-in-out, transform 0.1s ease-in-out;
        }

        .react-calendar-datetime-picker {
            display: flex !important;
            justify-content: left !important;
        }

        .header {
            margin-bottom: 0px !important;
            position: relative;
        }

        .form-select-default {
            height: auto !important;
            line-height: 1.25;
        }
        .no-click {
            pointer-events: none; /* Prevent clicks */
            cursor: not-allowed;  /* Change cursor to indicate no interaction */
        }
    </style>
    <script> const global = globalThis; </script>
    @vite('resources/js/app.jsx')
    @inertiaHead

    <link href="{{ asset('assets/css/modern.css') }}" rel="stylesheet">
    <link href="{{ asset('assets/tabler-icons/tabler-icons.css') }}" rel="stylesheet">
</head>

<body>
    @inertia

    <script src="{{ asset('assets/js/app.js') }}"></script>
</body>

</html>
