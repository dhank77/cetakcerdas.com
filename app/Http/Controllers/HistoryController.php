<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class HistoryController extends Controller
{
    /**
     * Display the print history page.
     */
    public function index(): Response
    {
        // TODO: Implement actual print history logic
        $printHistory = [
            [
                'id' => 1,
                'document_name' => 'Document 1.pdf',
                'pages' => 5,
                'copies' => 2,
                'total_cost' => 5000,
                'status' => 'completed',
                'created_at' => now()->subDays(1),
            ],
            [
                'id' => 2,
                'document_name' => 'Document 2.docx',
                'pages' => 3,
                'copies' => 1,
                'total_cost' => 1500,
                'status' => 'completed',
                'created_at' => now()->subDays(2),
            ],
        ];

        return Inertia::render('admin/history/index', [
            'history' => $printHistory,
        ]);
    }
}