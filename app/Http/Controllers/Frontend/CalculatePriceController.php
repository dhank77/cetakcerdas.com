<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class CalculatePriceController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,docx,doc|max:2048',
        ]);

        $fastapi = config('fastapi.url');
        $file = $request->file('file');

        $priceSettingPhoto = 2000;
        $priceSettingColor = 1000;
        $priceSettingBw = 500;

        $colorThreshold = 20;
        $photoThreshold = 30;

        $slug = $request->slug ?? 'testing';

        $user = User::where('slug', $slug)->first();

        if ($user && $user->setting) {
            $setting = $user->setting;
            $priceSettingColor = $setting->color_price;
            $priceSettingPhoto = $setting->photo_price ?? $setting->color_price;
            $priceSettingBw = $setting->bw_price;

            $colorThreshold = $setting->threshold_color ?? 20;
            $photoThreshold = $setting->threshold_photo ?? 30;
        }

        $fileName = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
        $filePath = 'temp-uploads/' . $slug . '/' . $fileName;
        Storage::disk('public')->put($filePath, file_get_contents($file));
        $fullUrl = asset('storage/' . $filePath);

        try {

            $response = Http::timeout(10)
                ->asMultipart()
                ->post("$fastapi/analyze-document?color_threshold={$colorThreshold}&photo_threshold={$photoThreshold}", [
                    [
                        'name' => 'file',
                        'contents' => file_get_contents($file),
                        'filename' => $file->getClientOriginalName(),
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('FastAPI Error Response', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'url' => "$fastapi/analyze-document"
                ]);

                throw new Exception('Gagal menganalisis dokumen: ' . $response->status());
            }

            $responApi = $response->json();

            if (!isset($responApi['color_pages']) || !isset($responApi['bw_pages']) || !isset($responApi['photo_pages'])) {
                throw new Exception('Response API tidak valid');
            }
        } catch (\Exception $e) {
            Log::error('FastAPI Connection Error', [
                'message' => $e->getMessage(),
                'fastapi_url' => $fastapi,
                'file_name' => $file->getClientOriginalName()
            ]);

            $responApi = [
                'color_pages' => 0,
                'bw_pages' => 0,
                'photo_pages' => 0,
                'total_pages' => 0,
                'page_details' => []
            ];
        }

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
            'pengaturan' => [
                'threshold_warna' => (string)$colorThreshold,
                'threshold_foto' => (string)$photoThreshold,
                'price_setting_color' => $priceSettingColor,
                'price_setting_bw' => $priceSettingBw,
                'price_setting_photo' => $priceSettingPhoto,
            ],
            ...$responApi,
        ]);
    }
}
