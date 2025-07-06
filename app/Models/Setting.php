<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    protected $fillable = [
        'user_id',
        'bw_price',
        'color_price',
        'photo_price',
        'threshold_color',
        'threshold_photo',
    ];

    protected $casts = [
        'bw_price' => 'float',
        'color_price' => 'float',
        'photo_price' => 'float',
        'threshold_color' => 'float',
        'threshold_photo' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
