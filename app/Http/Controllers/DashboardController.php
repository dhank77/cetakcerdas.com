<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $orders = Order::where('user_id', auth()->user()->id)->get();
        return Inertia::render('dashboard', [
            'orders' => $orders,
        ]);
    }
}
