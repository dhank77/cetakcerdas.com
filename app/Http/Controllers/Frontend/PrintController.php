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
                $priceSettingPhoto = $setting->photo_price > 0 ? $setting->photo_price : $setting->color_price;
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
            if (!$url || count($url) < 3 || $url['2'] === "") {
                return redirect()->back()->with([
                    'type' => 'success',
                    'messages' => 'Pesanan selesai',
                ]);
            }
            $slug = $url[2];

            $items = json_decode($request->items);
            if (count($items) < 1) {
                return redirect()->back()->with([
                    'type' => 'error',
                    'messages' => 'Pesanan tidak valid',
                ]);
            }

            $user = User::where('slug', $slug)->first();
            abort_if(!$user, 404);

            foreach ($items as $item) {
                $user->orders()->create([
                    'full_log' => json_encode($item),
    
                    'timestamp_id' => $item->timestamp,
                    'price_bw' => $item->priceBw,
                    'price_color' => $item->priceColor,
                    'price_photo' => $item->pricePhoto,
                    'total_price' => $item->totalPrice,
                    'bw_pages' => $item->bwPages,
                    'color_pages' => $item->colorPages,
                    'photo_pages' => $item->photoPages,
                    'total_pages' => $item->totalPages,
                ]);
            }

            return redirect()->back()->with([
                'type' => 'success',
                'messages' => 'Pesanan selesai',
            ]);
        }

        return redirect()->back()->with([
            'type' => 'error',
            'messages' => 'Terjadi kesalahan',
        ]);

    }

    public function protected(Request $request): Response|RedirectResponse
    {
        // Check if request is from desktop app (Electron)
        $isDesktopApp = str_contains($request->userAgent(), 'Electron') || 
                       $request->hasHeader('X-Desktop-App') ||
                       $request->ip() === '127.0.0.1';
        
        $protectedUserId = session('protected_user');
        if ($isDesktopApp && $protectedUserId) {
            return redirect()->route('print.protected.validated');
        }
        
        return Inertia::render('frontend/print/protected-auth');
    }

    public function protectedAccess(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => 'required|string',
            'pin' => 'required|string|max:6',
        ]);

        $users = User::where('pin', $request->pin)->get();
        $user = null;
        
        foreach ($users as $potentialUser) {
            if (password_verify($request->password, $potentialUser->password)) {
                $user = $potentialUser;
                break;
            }
        }

        if (!$user) {
            return redirect()->back()->withErrors([
                'auth' => 'Password atau PIN tidak valid.'
            ])->withInput();
        }

        session(['protected_user' => $user->id]);
        $cookie = cookie('protected_user_backup', $user->id, 525600); // 1 year in minutes
        
        return redirect()->route('print.protected.validated')->withCookie($cookie);
    }

    public function protectedValidated(Request $request) : Response|RedirectResponse 
    {
        // Debug logging for desktop app detection
        $userAgent = $request->userAgent();
        $hasElectron = str_contains($userAgent, 'Electron');
        $hasDesktopHeader = $request->hasHeader('X-Desktop-App');
        $desktopHeaderValue = $request->header('X-Desktop-App');
        $isLocalhost = $request->ip() === '127.0.0.1';
        
        \Log::info('Desktop App Detection Debug', [
            'user_agent' => $userAgent,
            'has_electron' => $hasElectron,
            'has_desktop_header' => $hasDesktopHeader,
            'desktop_header_value' => $desktopHeaderValue,
            'is_localhost' => $isLocalhost,
            'client_ip' => $request->ip(),
            'all_headers' => $request->headers->all()
        ]);
        
        $isDesktopApp = $hasElectron || $hasDesktopHeader || $isLocalhost;
        
        $protectedUserId = session('protected_user');
        
        if (!$protectedUserId && $request->cookie('protected_user_backup')) {
            $protectedUserId = $request->cookie('protected_user_backup');
            session(['protected_user' => $protectedUserId]);
        }
        
        if (!$protectedUserId && $isDesktopApp) {
            return redirect()->route('print.protected');
        }
        
        $priceSettingPhoto = 2000;
        $priceSettingColor = 1000;
        $priceSettingBw = 500;

        $user = User::find($protectedUserId);
        if (!$user) {
            return redirect()->route('print.protected');
        }
        
        $setting = $user->setting;
        if ($setting) {
            $priceSettingColor = $setting->color_price;
            $priceSettingPhoto = $setting->photo_price > 0 ? $setting->photo_price : $setting->color_price;
            $priceSettingBw = $setting->bw_price;
        }

        return Inertia::render('frontend/print/protected-index', [
            'user' => $user,
            'priceSettingColor' => $priceSettingColor,
            'priceSettingPhoto' => $priceSettingPhoto,
            'priceSettingBw' => $priceSettingBw,
        ]);
    }

    public function redirect(): RedirectResponse
    {
        $user = Auth::user();

        return redirect()->route('print', $user->slug);
    }
}
