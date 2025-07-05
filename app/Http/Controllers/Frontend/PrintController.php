<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\User;
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
}
