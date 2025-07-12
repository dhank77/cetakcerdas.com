<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function index($slug): Response
    {
        return Inertia::render('frontend/booking/index', [
            'slug' => $slug,
        ]);
    }

    public function store(Request $request, $slug): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string',
            'whatsapp' => 'required|string',
            'file' => 'required|file|mimes:pdf|max:2048',
            'priceSettingColor' => 'nullable',
            'priceSettingBw' => 'nullable',
            'priceSettingPhoto' => 'nullable',
            'totalPrice' => 'nullable',
            'totalPages' => 'nullable',
            'bwPages' => 'nullable',
            'colorPages' => 'nullable',
            'photoPages' => 'nullable',
        ]);

        $user = User::where('slug', $slug)->first();
        abort_if(!$user, 404);

        $file = $request->file('file');
        $fileName = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
        $filePath = 'bookings/' . $slug . '/' . $fileName;
        Storage::disk('public')->put($filePath, file_get_contents($file));
        $fullUrl = asset('storage/' . $filePath);

        $order = $user->orders()->create([
            'full_log' => "",

            'timestamp_id' => 'Booking' . time(),
            'price_bw' => $request->priceBw ?? 0,
            'price_color' => $request->priceColor ?? 0,
            'price_photo' => $request->pricePhoto ?? 0,
            'total_price' => $request->totalPrice ?? 0,
            'bw_pages' => $request->bwPages ?? 0,
            'color_pages' => $request->colorPages ?? 0,
            'photo_pages' => $request->photoPages ?? 0,
            'total_pages' => $request->totalPages ?? 0,
        ]);

        $user->bookings()->create([
            'order_id' => $order->id,
            'name' => $request->name,
            'whatsapp' => $request->whatsapp,
            'file_name' => $fileName,
            'file_url' => $fullUrl,
            'file_type' => $file->getClientMimeType(),
        ]);

        return redirect()->back()->with([
            'type' => 'success',
            'messages' => 'Berhasil mengirim file',
        ]);
    }
}
