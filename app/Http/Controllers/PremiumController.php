<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PremiumController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        if ($request->user()->is_premium) {
            return redirect()->route('dashboard');
        }
        
        return Inertia::render('admin/premium/index');
    }
}
