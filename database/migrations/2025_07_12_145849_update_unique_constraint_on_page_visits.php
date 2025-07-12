<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE page_visits DROP CONSTRAINT page_visits_ip_address_page_unique');
        DB::statement('CREATE UNIQUE INDEX page_visits_ip_page_date_unique ON page_visits (ip_address, page, (DATE(created_at)))');

        DB::statement('ALTER TABLE page_visits DROP CONSTRAINT page_visits_visitor_id_page_unique');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX page_visits_ip_page_date_unique');
        DB::statement('ALTER TABLE page_visits ADD CONSTRAINT page_visits_ip_address_page_unique UNIQUE (ip_address, page)');
        
        DB::statement('ALTER TABLE page_visits ADD CONSTRAINT page_visits_visitor_id_page_unique UNIQUE (visitor_id, page)');
    }
};
