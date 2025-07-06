<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('page_visits', function (Blueprint $table) {
            $table->id();
            $table->string('visitor_id');
            $table->string('page');
            $table->unsignedInteger('visit_count')->default(1);
            $table->string('ip_address');
            $table->string('user_agent')->nullable();

            $table->timestamps();

            $table->unique(['ip_address', 'page']);
            $table->unique(['visitor_id', 'page']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_visits');
    }
};
