<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function __invoke(Request $request)
    {
        return Inertia::render('frontend/landing/index');
    }
}
