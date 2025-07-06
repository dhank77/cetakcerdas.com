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

    public function order(Request $request): RedirectResponse 
    {
        $request->validate([
            'items' => 'required|string',
            'url' => 'nullable|string'
        ]);

        if ($request->url) {
            $url = explode('/', parse_url($request->url, PHP_URL_PATH));
            if (!$url || count($url) < 3) {
                return redirect()->back()->with([
                    'type' => 'success',
                    'messages' => 'Pesanan selesai',
                ]);
            }
            $slug = $url[2];

            $items = json_decode($request->items);
            if (!isset($items[0])) {
                return redirect()->back()->with([
                    'type' => 'error',
                    'messages' => 'Pesanan tidak valid',
                ]);
            }

            $items = $items[0];

            $user = User::where('slug', $slug)->first();
            abort_if(!$user, 404);

            $order = $user->orders()->create([
                'full_log' => $request->items,

                'timestamp_id' => $items->timestamp,
                'price_bw' => $items->priceBw,
                'price_color' => $items->priceColor,
                'price_photo' => $items->pricePhoto,
                'total_price' => $items->totalPrice,
                'bw_pages' => $items->bwPages,
                'color_pages' => $items->colorPages,
                'photo_pages' => $items->photoPages,
                'total_pages' => $items->totalPages,
            ]);

            if (!$order) {
                return redirect()->back()->with([
                    'type' => 'error',
                    'messages' => 'Terjadi kesalahan',
                ]);
            }
        }

        return redirect()->back()->with([
            'type' => 'success',
            'messages' => 'Pesanan selesai',
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
