<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    public function index()
    {
        return MenuItem::with(['category', 'ingredients'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable', // Can be file or string (url)
            'is_available' => 'boolean',
            'ingredients' => 'array',
            'ingredients.*.id' => 'required|exists:ingredients,id',
            'ingredients.*.quantity' => 'required|numeric|min:0',
            'ingredients.*.unit' => 'nullable|string',
            'discount_value' => 'nullable|numeric|min:0',
            'discount_reason' => 'nullable|string',
            'is_discount_active' => 'boolean'
        ]);

        $menuItem = DB::transaction(function () use ($validated, $request) {
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('menu_items', 'public');
            }

            $menuItem = MenuItem::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'image' => $imagePath,
                'is_available' => $validated['is_available'] ?? true,
                'discount_value' => $validated['discount_value'] ?? 0,
                'discount_reason' => $validated['discount_reason'] ?? null,
                'is_discount_active' => $validated['is_discount_active'] ?? false,
            ]);

            if (isset($validated['ingredients'])) {
                $syncData = [];
                foreach ($validated['ingredients'] as $ingredient) {
                    $syncData[$ingredient['id']] = [
                        'quantity' => $ingredient['quantity'],
                        'unit' => $ingredient['unit'] ?? null,
                    ];
                }
                $menuItem->ingredients()->sync($syncData);
            }

            return $menuItem;
        });

        return response()->json($menuItem->load('ingredients'), 201);
    }

    public function show(MenuItem $menuItem)
    {
        return $menuItem->load(['category', 'ingredients']);
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'category_id' => 'exists:categories,id',
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'image' => 'nullable',
            'is_available' => 'boolean',
            'ingredients' => 'array',
            'ingredients.*.id' => 'exists:ingredients,id',
            'ingredients.*.quantity' => 'numeric|min:0',
            'ingredients.*.unit' => 'nullable|string',
            'discount_value' => 'nullable|numeric|min:0',
            'discount_reason' => 'nullable|string',
            'is_discount_active' => 'boolean'
        ]);

        $menuItem = DB::transaction(function () use ($validated, $menuItem, $request) {
            $imagePath = $menuItem->image;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('menu_items', 'public');
            }

            $menuItem->update([
                'category_id' => $validated['category_id'] ?? $menuItem->category_id,
                'name' => $validated['name'] ?? $menuItem->name,
                'description' => $validated['description'] ?? $menuItem->description,
                'price' => $validated['price'] ?? $menuItem->price,
                'image' => $imagePath,
                'is_available' => $validated['is_available'] ?? $menuItem->is_available,
                'discount_value' => $validated['discount_value'] ?? $menuItem->discount_value,
                'discount_reason' => $validated['discount_reason'] ?? $menuItem->discount_reason,
                'is_discount_active' => $validated['is_discount_active'] ?? $menuItem->is_discount_active,
            ]);

            if (isset($validated['ingredients'])) {
                $syncData = [];
                foreach ($validated['ingredients'] as $ingredient) {
                    $syncData[$ingredient['id']] = [
                        'quantity' => $ingredient['quantity'],
                        'unit' => $ingredient['unit'] ?? null,
                    ];
                }
                $menuItem->ingredients()->sync($syncData);
            }

            return $menuItem;
        });

        return $menuItem->load('ingredients');
    }

    public function destroy(MenuItem $menuItem)
    {
        $menuItem->delete();
        return response()->json(null, 204);
    }
}
