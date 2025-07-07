<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $userId = auth()->user()->id;
        
        $stats = $this->getAggregatedStats($userId);
        
        $recentOrders = Order::where('user_id', $userId)
            ->select(['id', 'total_price', 'total_pages', 'created_at'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
        ]);
    }
    
    private function getAggregatedStats($userId)
    {
        $now = now();
        $today = $now->startOfDay();
        $thisMonth = $now->copy()->startOfMonth();
        $thisYear = $now->copy()->startOfYear();
        
        // Get today's stats
        $todayStats = Order::where('user_id', $userId)
            ->where('created_at', '>=', $today)
            ->selectRaw('
                COUNT(*) as count,
                COALESCE(SUM(total_price), 0) as revenue,
                COALESCE(SUM(total_pages), 0) as pages,
                COUNT(DISTINCT user_id) as customers
            ')
            ->first();
            
        // Get this month's stats
        $monthStats = Order::where('user_id', $userId)
            ->where('created_at', '>=', $thisMonth)
            ->selectRaw('
                COUNT(*) as count,
                COALESCE(SUM(total_price), 0) as revenue,
                COALESCE(SUM(total_pages), 0) as pages,
                COUNT(DISTINCT user_id) as customers
            ')
            ->first();
            
        // Get this year's stats
        $yearStats = Order::where('user_id', $userId)
            ->where('created_at', '>=', $thisYear)
            ->selectRaw('
                COUNT(*) as count,
                COALESCE(SUM(total_price), 0) as revenue,
                COALESCE(SUM(total_pages), 0) as pages,
                COUNT(DISTINCT user_id) as customers
            ')
            ->first();
            
        // Get breakdown by print type
        $breakdown = Order::where('user_id', $userId)
            ->selectRaw('
                COALESCE(SUM(bw_pages), 0) as bw_pages,
                COALESCE(SUM(color_pages), 0) as color_pages,
                COALESCE(SUM(photo_pages), 0) as photo_pages
            ')
            ->first();
            
        return [
            'today' => [
                'count' => $todayStats->count ?? 0,
                'revenue' => $todayStats->revenue ?? 0,
                'pages' => $todayStats->pages ?? 0,
                'customers' => $todayStats->customers ?? 0,
            ],
            'month' => [
                'count' => $monthStats->count ?? 0,
                'revenue' => $monthStats->revenue ?? 0,
                'pages' => $monthStats->pages ?? 0,
                'customers' => $monthStats->customers ?? 0,
            ],
            'year' => [
                'count' => $yearStats->count ?? 0,
                'revenue' => $yearStats->revenue ?? 0,
                'pages' => $yearStats->pages ?? 0,
                'customers' => $yearStats->customers ?? 0,
            ],
            'breakdown' => [
                'bwPages' => $breakdown->bw_pages ?? 0,
                'colorPages' => $breakdown->color_pages ?? 0,
                'photoPages' => $breakdown->photo_pages ?? 0,
            ]
        ];
    }
}
