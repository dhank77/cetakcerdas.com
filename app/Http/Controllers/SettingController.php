<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(Request $request): Response
    {
        $setting = Setting::where('user_id', $request->user()->id)->first();
        
        return Inertia::render('setting/index',[
            'setting' => $setting,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'bw_price' => 'required|numeric|min:0',
            'color_price' => 'required|numeric|min:0',
            'photo_price' => 'nullable|numeric|min:0',
            'threshold_color' => 'nullable|numeric|min:0|max:100',
            'threshold_photo' => 'nullable|numeric|min:0|max:100',
        ]);

        $data['user_id'] = $request->user()->id;

        if(Setting::create($data)) {
            return redirect()->route('setting')->with([
                'type' => 'success',
                'messages' => 'Pengaturan berhasil disimpan!',
            ]);
        }

        return redirect()->route('setting')->with([
            'type' => 'error',
            'messages' => 'Pengaturan gagal disimpan!',
        ]);
    }

    public function update(Setting $setting, Request $request)
    {
        abort_if($setting->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'bw_price' => 'required|numeric|min:0',
            'color_price' => 'required|numeric|min:0',
            'photo_price' => 'nullable|numeric|min:0',
            'threshold_color' => 'nullable|numeric|min:0|max:100',
            'threshold_photo' => 'nullable|numeric|min:0|max:100',
        ]);

        if($setting->update($data)) {
            return redirect()->route('setting')->with([
                'type' => 'success',
                'messages' => 'Pengaturan berhasil diperbarui!',
            ]);
        }

        return redirect()->route('setting')->with([
            'type' => 'error',
            'messages' => 'Pengaturan gagal diperbarui!',
        ]);
    }
}
