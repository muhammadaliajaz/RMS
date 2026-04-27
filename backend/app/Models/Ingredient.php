<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'unit',
        'cost',
        'stock',
        'min_stock'
    ];

    public function menuItems()
    {
        return $this->belongsToMany(MenuItem::class, 'recipe_ingredients')
                    ->withPivot('quantity', 'unit');
    }
}
