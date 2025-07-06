<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'price_bw',
        'price_color',
        'price_photo',
        'total_price',
        'bw_pages',
        'color_pages',
        'photo_pages',
        'total_pages',
        'timestamp_id',
        'full_log',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
