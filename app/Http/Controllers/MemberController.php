<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    /**
     * Display the members page.
     */
    public function index(): Response
    {
        // TODO: Implement actual members logic
        $members = [
            [
                'id' => 1,
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '+62812345678',
                'membership_type' => 'premium',
                'total_orders' => 15,
                'total_spent' => 75000,
                'joined_at' => now()->subMonths(3),
                'status' => 'active',
            ],
            [
                'id' => 2,
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'phone' => '+62887654321',
                'membership_type' => 'basic',
                'total_orders' => 8,
                'total_spent' => 32000,
                'joined_at' => now()->subMonths(1),
                'status' => 'active',
            ],
            [
                'id' => 3,
                'name' => 'Bob Wilson',
                'email' => 'bob@example.com',
                'phone' => '+62856789012',
                'membership_type' => 'basic',
                'total_orders' => 3,
                'total_spent' => 12000,
                'joined_at' => now()->subWeeks(2),
                'status' => 'inactive',
            ],
        ];

        return Inertia::render('admin/members/index', [
            'members' => $members,
        ]);
    }

    /**
     * Show the specified member.
     */
    public function show(string $id): Response
    {
        // TODO: Implement actual member retrieval logic
        $member = [
            'id' => $id,
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+62812345678',
            'membership_type' => 'premium',
            'total_orders' => 15,
            'total_spent' => 75000,
            'joined_at' => now()->subMonths(3),
            'status' => 'active',
            'recent_orders' => [
                ['id' => 1, 'order_number' => 'ORD-001', 'total' => 5000, 'created_at' => now()->subDays(1)],
                ['id' => 2, 'order_number' => 'ORD-002', 'total' => 3000, 'created_at' => now()->subDays(3)],
            ],
        ];

        return Inertia::render('admin/members/show', [
            'member' => $member,
        ]);
    }
}