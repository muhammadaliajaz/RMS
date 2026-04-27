<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Ingredient;
use Illuminate\Support\Facades\DB;

class InventoryMenuSeeder extends Seeder
{
    public function run()
    {
        // 1. Categories
        $categories = [
            ['name' => 'Burgers', 'type' => 'food'],
            ['name' => 'Pizza', 'type' => 'food'],
            ['name' => 'Sides', 'type' => 'food'],
            ['name' => 'Drinks', 'type' => 'beverage'],
            ['name' => 'Dessert', 'type' => 'food'],
            ['name' => 'Snacks', 'type' => 'food'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['name' => $cat['name']], $cat);
        }

        $burgerCat = Category::where('name', 'Burgers')->first();
        $pizzaCat = Category::where('name', 'Pizza')->first();
        $sidesCat = Category::where('name', 'Sides')->first();
        $drinksCat = Category::where('name', 'Drinks')->first();
        $dessertCat = Category::where('name', 'Dessert')->first();
        $snacksCat = Category::where('name', 'Snacks')->first();

        // 2. Ingredients (Inventory)
        $ingredients = [
            ['name' => 'Beef Patty', 'unit' => 'pcs', 'cost' => 1.5, 'stock' => 100, 'min_stock' => 20, 'category' => 'meat', 'supplier' => 'Meat Bros'],
            ['name' => 'Burger Bun', 'unit' => 'pcs', 'cost' => 0.5, 'stock' => 150, 'min_stock' => 30, 'category' => 'dry', 'supplier' => 'Bakery One'],
            ['name' => 'Cheddar Cheese', 'unit' => 'slice', 'cost' => 0.3, 'stock' => 200, 'min_stock' => 50, 'category' => 'dairy', 'supplier' => 'Dairy Farm'],
            ['name' => 'Lettuce', 'unit' => 'kg', 'cost' => 2.0, 'stock' => 10, 'min_stock' => 2, 'category' => 'produce', 'supplier' => 'Fresh Fields'],
            ['name' => 'Tomato', 'unit' => 'kg', 'cost' => 1.8, 'stock' => 15, 'min_stock' => 3, 'category' => 'produce', 'supplier' => 'Fresh Fields'],
            ['name' => 'Potato Fries', 'unit' => 'kg', 'cost' => 1.2, 'stock' => 50, 'min_stock' => 10, 'category' => 'frozen', 'supplier' => 'Frozen Co'],
            ['name' => 'Special Sauce', 'unit' => 'L', 'cost' => 5.0, 'stock' => 5, 'min_stock' => 1, 'category' => 'dry', 'supplier' => 'Sauce Boss'],
        ];

        foreach ($ingredients as $ing) {
            Ingredient::firstOrCreate(['name' => $ing['name']], $ing);
        }

        // 3. Menu Items & Linking
        // Classic Burger
        $classicBurger = MenuItem::firstOrCreate(
            ['name' => 'Classic Burger'],
            [
                'category_id' => $burgerCat->id,
                'price' => 8.99,
                'description' => 'Juicy beef patty with fresh lettuce and tomato.',
                'is_available' => true
            ]
        );

        // Link Ingredients to Classic Burger
        $this->attachIngredient($classicBurger, 'Beef Patty', 1);
        $this->attachIngredient($classicBurger, 'Burger Bun', 1);
        $this->attachIngredient($classicBurger, 'Lettuce', 0.05); // 50g
        $this->attachIngredient($classicBurger, 'Tomato', 0.05); // 50g
        $this->attachIngredient($classicBurger, 'Special Sauce', 0.02); // 20ml

        // Cheese Burger
        $cheeseBurger = MenuItem::firstOrCreate(
            ['name' => 'Cheeseburger'],
            [
                'category_id' => $burgerCat->id,
                'price' => 9.99,
                'description' => 'Classic burger with melted cheddar cheese.',
                'is_available' => true
            ]
        );

        $this->attachIngredient($cheeseBurger, 'Beef Patty', 1);
        $this->attachIngredient($cheeseBurger, 'Burger Bun', 1);
        $this->attachIngredient($cheeseBurger, 'Cheddar Cheese', 1);
        $this->attachIngredient($cheeseBurger, 'Lettuce', 0.05);
        $this->attachIngredient($cheeseBurger, 'Special Sauce', 0.02);

        // Large Fries
        $fries = MenuItem::firstOrCreate(
            ['name' => 'Golden Fries'],
            [
                'category_id' => $sidesCat->id,
                'price' => 3.99,
                'description' => 'Crispy golden potato fries.',
                'is_available' => true
            ]
        );
        
        $this->attachIngredient($fries, 'Potato Fries', 0.250); // 250g portion

        // Margherita Pizza
        $margherita = MenuItem::firstOrCreate(
            ['name' => 'Margherita Pizza'],
            [
                'category_id' => $pizzaCat->id,
                'price' => 8.50,
                'description' => 'Tomato sauce, mozzarella, and basil.',
                'is_available' => true
            ]
        );

        // Drinks
        MenuItem::firstOrCreate(['name' => 'Coca Cola'], ['category_id' => $drinksCat->id, 'price' => 1.50, 'description' => 'Chilled 330ml can', 'is_available' => true]);
        MenuItem::firstOrCreate(['name' => 'Orange Juice'], ['category_id' => $drinksCat->id, 'price' => 2.50, 'description' => 'Freshly squeezed', 'is_available' => true]);

        // Desserts
        MenuItem::firstOrCreate(['name' => 'Cheesecake'], ['category_id' => $dessertCat->id, 'price' => 4.50, 'description' => 'New York style cheesecake slice', 'is_available' => true]);
    }

    private function attachIngredient($menuItem, $ingredientName, $qty)
    {
        $ing = Ingredient::where('name', $ingredientName)->first();
        if ($ing) {
            // Check if already attached
            if (!$menuItem->ingredients()->where('ingredient_id', $ing->id)->exists()) {
                $menuItem->ingredients()->attach($ing->id, ['quantity' => $qty, 'unit' => $ing->unit]);
            }
        }
    }
}
