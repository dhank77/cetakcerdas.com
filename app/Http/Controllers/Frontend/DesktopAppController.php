<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DesktopAppController extends Controller
{
    public function download(): Response
    {
        return Inertia::render('frontend/desktop-app/download');
    }
}