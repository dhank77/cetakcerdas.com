<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    /**
     * Display the testimonials page.
     */
    public function index(): Response
    {
        // TODO: Implement actual testimonials logic
        $testimonials = [
            [
                'id' => 1,
                'customer_name' => 'John Doe',
                'customer_email' => 'john@example.com',
                'rating' => 5,
                'title' => 'Excellent Service!',
                'content' => 'The print quality is amazing and the service is very fast. Highly recommended!',
                'status' => 'approved',
                'created_at' => now()->subDays(2),
            ],
            [
                'id' => 2,
                'customer_name' => 'Jane Smith',
                'customer_email' => 'jane@example.com',
                'rating' => 4,
                'title' => 'Great Experience',
                'content' => 'Very satisfied with the printing service. The staff is friendly and helpful.',
                'status' => 'approved',
                'created_at' => now()->subDays(5),
            ],
            [
                'id' => 3,
                'customer_name' => 'Bob Wilson',
                'customer_email' => 'bob@example.com',
                'rating' => 5,
                'title' => 'Perfect Quality',
                'content' => 'The documents came out exactly as I expected. Will definitely use again.',
                'status' => 'pending',
                'created_at' => now()->subHours(3),
            ],
            [
                'id' => 4,
                'customer_name' => 'Alice Johnson',
                'customer_email' => 'alice@example.com',
                'rating' => 4,
                'title' => 'Good Service',
                'content' => 'Quick turnaround time and reasonable prices. Good overall experience.',
                'status' => 'approved',
                'created_at' => now()->subWeek(),
            ],
        ];

        $stats = [
            'total_testimonials' => count($testimonials),
            'approved_testimonials' => count(array_filter($testimonials, fn($t) => $t['status'] === 'approved')),
            'pending_testimonials' => count(array_filter($testimonials, fn($t) => $t['status'] === 'pending')),
            'average_rating' => round(array_sum(array_column($testimonials, 'rating')) / count($testimonials), 1),
        ];

        return Inertia::render('admin/testimonials/index', [
            'testimonials' => $testimonials,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the specified testimonial.
     */
    public function show(string $id): Response
    {
        // TODO: Implement actual testimonial retrieval logic
        $testimonial = [
            'id' => $id,
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.com',
            'rating' => 5,
            'title' => 'Excellent Service!',
            'content' => 'The print quality is amazing and the service is very fast. Highly recommended!',
            'status' => 'approved',
            'created_at' => now()->subDays(2),
        ];

        return Inertia::render('admin/testimonials/show', [
            'testimonial' => $testimonial,
        ]);
    }

    /**
     * Update the testimonial status.
     */
    public function updateStatus(string $id)
    {
        // TODO: Implement actual status update logic
        
        return redirect()->route('testimonials.index')
            ->with('success', 'Testimonial status updated successfully.');
    }
}