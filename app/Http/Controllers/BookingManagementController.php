<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingManagementController extends Controller
{
    public function index(): Response
    {
        $bookings = Booking::with(['user', 'order'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'name' => $booking->name,
                    'whatsapp' => $booking->whatsapp,
                    'file_name' => $booking->file_name,
                    'file_url' => $booking->file_url,
                    'file_type' => $booking->file_type,
                    'total_price' => $booking->order->total_price ?? 0,
                    'total_pages' => $booking->order->total_pages ?? 0,
                    'bw_pages' => $booking->order->bw_pages ?? 0,
                    'color_pages' => $booking->order->color_pages ?? 0,
                    'photo_pages' => $booking->order->photo_pages ?? 0,
                    'timestamp_id' => $booking->order->timestamp_id ?? '',
                    'user_name' => $booking->user->name ?? '',
                    'created_at' => $booking->created_at->format('d/m/Y H:i'),
                ];
            });

        return Inertia::render('admin/bookings/index', [
            'bookings' => $bookings,
        ]);
    }
}