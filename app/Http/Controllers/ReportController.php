<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the reports page.
     */
    public function index(): Response
    {
        // TODO: Implement actual reports logic
        $reports = [
            'daily_stats' => [
                'total_orders' => 25,
                'total_revenue' => 125000,
                'total_pages_printed' => 150,
                'active_customers' => 18,
            ],
            'weekly_stats' => [
                'total_orders' => 180,
                'total_revenue' => 850000,
                'total_pages_printed' => 1200,
                'active_customers' => 95,
            ],
            'monthly_stats' => [
                'total_orders' => 750,
                'total_revenue' => 3500000,
                'total_pages_printed' => 5000,
                'active_customers' => 320,
            ],
            'top_customers' => [
                ['name' => 'John Doe', 'orders' => 15, 'spent' => 75000],
                ['name' => 'Jane Smith', 'orders' => 12, 'spent' => 60000],
                ['name' => 'Bob Wilson', 'orders' => 10, 'spent' => 45000],
            ],
            'popular_services' => [
                ['service' => 'Document Print', 'count' => 120, 'revenue' => 240000],
                ['service' => 'Color Print', 'count' => 80, 'revenue' => 320000],
                ['service' => 'Photo Print', 'count' => 45, 'revenue' => 180000],
            ],
            'recent_activity' => [
                ['type' => 'order', 'description' => 'New order from John Doe', 'time' => now()->subMinutes(15)],
                ['type' => 'payment', 'description' => 'Payment received for ORD-001', 'time' => now()->subMinutes(30)],
                ['type' => 'print', 'description' => 'Document printed successfully', 'time' => now()->subHours(1)],
            ],
        ];

        return Inertia::render('admin/reports/index', [
            'reports' => $reports,
        ]);
    }

    /**
     * Display sales report.
     */
    public function sales(): Response
    {
        // TODO: Implement actual sales report logic
        $salesData = [
            'chart_data' => [
                'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                'datasets' => [
                    [
                        'label' => 'Revenue',
                        'data' => [500000, 750000, 600000, 900000, 800000, 1200000],
                    ],
                ],
            ],
            'summary' => [
                'total_revenue' => 4750000,
                'average_order_value' => 15000,
                'total_orders' => 316,
                'growth_rate' => 15.5,
            ],
        ];

        return Inertia::render('admin/reports/sales', [
            'salesData' => $salesData,
        ]);
    }
}