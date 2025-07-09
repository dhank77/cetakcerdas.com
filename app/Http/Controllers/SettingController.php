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

    public function action(Request $request)
    {
        $data = $request->validate([
            'bw_price' => 'required|numeric|min:0',
            'color_price' => 'required|numeric|min:0',
            'photo_price' => 'nullable|numeric|min:0',
            'threshold_color' => 'nullable|numeric|min:0|max:100',
            'threshold_photo' => 'nullable|numeric|min:0|max:100',
        ]);

        $data['user_id'] = $request->user()->id;
        $id = $request->input('id');

        if ($id) {
            $action = Setting::where('id', $id)->update($data);
        } else {
            $action = Setting::create($data);
        }

        if($action) {
            return redirect()->route('setting.index')->with([
                'type' => 'success',
                'messages' => 'Pengaturan berhasil disimpan!',
            ]);
        }

        return redirect()->route('setting.index')->with([
            'type' => 'error',
            'messages' => 'Pengaturan gagal disimpan!',
        ]);
    }
}
