<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    /**
     * Display the billing page.
     */
    public function index(): Response
    {
        // TODO: Implement actual billing logic
        $billingData = [
            'current_plan' => [
                'name' => 'Premium Plan',
                'price' => 99000,
                'billing_cycle' => 'monthly',
                'features' => [
                    'Unlimited prints',
                    'Priority support',
                    'Advanced analytics',
                    'Custom branding',
                ],
                'next_billing_date' => now()->addMonth(),
            ],
            'usage_stats' => [
                'prints_this_month' => 1250,
                'prints_limit' => 'unlimited',
                'storage_used' => '2.5 GB',
                'storage_limit' => '10 GB',
            ],
            'billing_history' => [
                [
                    'id' => 1,
                    'invoice_number' => 'INV-2024-001',
                    'amount' => 99000,
                    'status' => 'paid',
                    'date' => now()->subMonth(),
                    'description' => 'Premium Plan - Monthly',
                ],
                [
                    'id' => 2,
                    'invoice_number' => 'INV-2024-002',
                    'amount' => 99000,
                    'status' => 'paid',
                    'date' => now()->subMonths(2),
                    'description' => 'Premium Plan - Monthly',
                ],
                [
                    'id' => 3,
                    'invoice_number' => 'INV-2024-003',
                    'amount' => 99000,
                    'status' => 'paid',
                    'date' => now()->subMonths(3),
                    'description' => 'Premium Plan - Monthly',
                ],
            ],
            'payment_methods' => [
                [
                    'id' => 1,
                    'type' => 'credit_card',
                    'last_four' => '4242',
                    'brand' => 'visa',
                    'is_default' => true,
                    'expires_at' => '12/2025',
                ],
            ],
            'available_plans' => [
                [
                    'name' => 'Basic Plan',
                    'price' => 49000,
                    'billing_cycle' => 'monthly',
                    'features' => [
                        '500 prints per month',
                        'Email support',
                        'Basic analytics',
                    ],
                ],
                [
                    'name' => 'Premium Plan',
                    'price' => 99000,
                    'billing_cycle' => 'monthly',
                    'features' => [
                        'Unlimited prints',
                        'Priority support',
                        'Advanced analytics',
                        'Custom branding',
                    ],
                    'is_current' => true,
                ],
                [
                    'name' => 'Enterprise Plan',
                    'price' => 199000,
                    'billing_cycle' => 'monthly',
                    'features' => [
                        'Unlimited prints',
                        '24/7 phone support',
                        'Advanced analytics',
                        'Custom branding',
                        'API access',
                        'Dedicated account manager',
                    ],
                ],
            ],
        ];

        return Inertia::render('admin/billing/index', [
            'billingData' => $billingData,
        ]);
    }
}