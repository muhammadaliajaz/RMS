<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use Illuminate\Http\Request;

class IngredientController extends Controller
{
    public function index()
    {
        return Ingredient::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'cost' => 'required|numeric|min:0',
            'stock' => 'required|numeric|min:0',
            'min_stock' => 'required|numeric|min:0',
            'category' => 'nullable|string',
            'supplier' => 'nullable|string',
        ]);

        $ingredient = Ingredient::create($validated);

        return response()->json($ingredient, 201);
    }

    public function show(Ingredient $ingredient)
    {
        return $ingredient;
    }

    public function update(Request $request, Ingredient $ingredient)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'unit' => 'string|max:50',
            'cost' => 'numeric|min:0',
            'stock' => 'numeric|min:0',
            'min_stock' => 'numeric|min:0',
            'category' => 'nullable|string',
            'supplier' => 'nullable|string',
        ]);

        $ingredient->update($validated);

        return $ingredient;
    }

    public function destroy(Ingredient $ingredient)
    {
        $ingredient->delete();
        return response()->json(null, 204);
    }
}
