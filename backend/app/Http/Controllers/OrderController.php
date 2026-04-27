<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Ingredient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request) {
        $query = Order::with(['items.menuItem', 'user'])->latest();
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return $query->get();
    }

    public function update(Request $request, Order $order) {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,ready,completed,cancelled'
        ]);

        $order->update(['status' => $validated['status']]);
        
        return $order;
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'table_number' => 'nullable|string',
            'payment_method' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                // Calculate Total & Verify Stock
                $totalAmount = 0;
                $orderItemsData = [];

                foreach ($validated['items'] as $item) {
                    $menuItem = MenuItem::with('ingredients')->find($item['menu_item_id']);
                    $quantity = $item['quantity'];
                    $lineTotal = $menuItem->price * $quantity;
                    
                    $totalAmount += $lineTotal;

                    // Deduct Stock
                    foreach ($menuItem->ingredients as $ingredient) {
                        $requiredQty = $ingredient->pivot->quantity * $quantity;
                        
                        // Optimistic Locking could be used here, but for now simple check
                        $currentStock = Ingredient::lockForUpdate()->find($ingredient->id);
                        
                        if ($currentStock->stock < $requiredQty) {
                            throw new \Exception("Insufficient stock for {$ingredient->name}. Required: {$requiredQty}, Available: {$currentStock->stock}");
                        }

                        $currentStock->decrement('stock', $requiredQty);
                    }

                    $orderItemsData[] = [
                        'menu_item_id' => $menuItem->id,
                        'quantity' => $quantity,
                        'price' => $menuItem->price,
                        'total' => $lineTotal
                    ];
                }

                // Create Order
                $order = Order::create([
                    'user_id' => $request->user()->id,
                    'table_number' => $validated['table_number'] ?? null,
                    'total_amount' => $totalAmount,
                    'payment_method' => $validated['payment_method'],
                    'guests' => $request->input('guests', 1),
                    'customer_name' => $request->input('customer_name', 'Walk-in Customer'),
                    'order_type' => $request->input('order_type', 'dine_in'),
                    'status' => 'pending' // Default to pending for KDS
                ]);

                // Create Items
                foreach ($orderItemsData as $data) {
                    $order->items()->create($data);
                }

                return $order->load('items');
            });

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
    public function getNextId()
    {
        $maxId = Order::max('id');
        return response()->json(['next_id' => $maxId ? $maxId + 1 : 1]);
    }
}
