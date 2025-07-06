<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PrintController extends Controller
{
    public function index(?string $slug = null) : Response 
    {
        $user = null;

        if ($slug) {
            $user = User::where('slug', $slug)->first();
            abort_if(!$user, 404);
        }

        return Inertia::render('frontend/print/index', [
            'user' => $user,
        ]);
    }

    public function redirect(Request $request): RedirectResponse
    {
        $user = auth()->user();

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('print', $user->slug);
    }
}
