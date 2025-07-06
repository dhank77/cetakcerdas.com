<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CalculatePriceController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,docx,doc',
        ]);

        $fastapi = config('fastapi.url');
        $file = $request->file('file');
        $user = $request->user();
        if ($user) {
            $setting = $user->setting;
            $priceSettingColor = $setting->price_color;
            $priceSettingPhoto = $setting->price_color;
            $priceSettingBw = $setting->price_bw;

            $colorThreshold = $setting->color_threshold;
            $photoThreshold = $setting->photo_threshold;

            $slug = $user->slug;
        } else {
            $priceSettingPhoto = 2000;
            $priceSettingColor = 1000;
            $priceSettingBw = 500;

            $colorThreshold = 20;
            $photoThreshold = 30;

            $slug = 'testing';
        }

        $fileName = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
        $filePath = 'temp-uploads/' . $slug . '/' . $fileName;
        Storage::disk('public')->put($filePath, file_get_contents($file));
        $fullUrl = asset('storage/' . $filePath);
        
        $response = Http::attach(
            'file',
            file_get_contents($file),
            $file->getClientOriginalName()
        )->post("$fastapi/analyze-document", [
            'color_threshold' => $colorThreshold,
            'photo_threshold' => $photoThreshold,
        ]);

        $responApi = $response->json();
        $priceColor = ($responApi['color_pages']) * $priceSettingColor;
        $priceBw = $responApi['bw_pages'] * $priceSettingBw;
        $pricePhoto = ($responApi['photo_pages']) * $priceSettingPhoto;

        $totalPrice = $priceColor + $priceBw + $pricePhoto;

        return response()->json([
            'price_color' => $priceColor,
            'price_bw' => $priceBw,
            'price_photo' => $pricePhoto,
            'total_price' => $totalPrice,
            'file_url' => $fullUrl,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientMimeType(),
            ...$responApi,
        ]);
    }
}
