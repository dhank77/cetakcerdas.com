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

        $priceSettingPhoto = 2000;
        $priceSettingColor = 1000;
        $priceSettingBw = 500;
        if ($slug) {
            $user = User::where('slug', $slug)->first();
            abort_if(!$user, 404);

            $setting = $user->setting;
            if ($setting) {
                $priceSettingColor = $setting->color_price;
                $priceSettingPhoto = $setting->photo_price ?? $setting->color_price;
                $priceSettingBw = $setting->bw_price;
            }
        }

        return Inertia::render('frontend/print/index', [
            'user' => $user,
            'priceSettingColor' => $priceSettingColor,
            'priceSettingPhoto' => $priceSettingPhoto,
            'priceSettingBw' => $priceSettingBw,
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
