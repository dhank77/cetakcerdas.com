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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->float('price_bw')->default(0);
            $table->float('price_color')->default(0);
            $table->float('price_photo')->default(0);
            $table->float('total_price')->default(0);
            $table->float('bw_pages')->default(0);
            $table->float('color_pages')->default(0);
            $table->float('photo_pages')->default(0);
            $table->float('total_pages')->default(0);
            $table->string('timestamp_id');
            $table->text('full_log');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
