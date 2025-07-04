<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CalculatePriceController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,docx,doc',
        ]);

        $fastapi = config('fastapi.url');

        $file = $request->file('file');
        $response = Http::attach(
            'file',
            file_get_contents($file),
            $file->getClientOriginalName()
        )->post("$fastapi/analyze-document");
        
        $price = $request->width * $request->height * $request->thickness * $request->quantity;

        return response()->json($response->json());
    }
}
