<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\Order;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        // 1. Low Stock Alerts
        // Get ingredients where stock <= min_stock
        $lowStockIngredients = Ingredient::whereColumn('stock', '<=', 'min_stock')->get();
        
        $alerts = [];

        foreach ($lowStockIngredients as $ing) {
            $alerts[] = [
                'type' => 'low_stock',
                'title' => 'Low Stock Alert',
                'message' => "{$ing->name} is running low ({$ing->stock} {$ing->unit} remaining)",
                'urgent' => true,
                'link' => '/inventory',
                'created_at' => now()
            ];
        }

        // 2. Pending Orders (For Kitchen attention)
        $pendingCount = Order::where('status', 'pending')->count();
        if ($pendingCount > 0) {
            $alerts[] = [
                'type' => 'new_orders',
                'title' => 'New Orders Pending',
                'message' => "There are {$pendingCount} new orders waiting for preparation",
                'urgent' => false,
                'link' => '/kitchen',
                'created_at' => now()
            ];
        }

        // 3. Ready Orders (For Waiters/Service)
        $readyCount = Order::where('status', 'ready')->count();
        if ($readyCount > 0) {
            $alerts[] = [
                'type' => 'ready_orders',
                'title' => 'Orders Ready to Serve',
                'message' => "{$readyCount} orders are cooked and ready to serve!",
                'urgent' => true,
                'link' => '/kitchen', // or a 'Service' view
                'created_at' => now()
            ];
        }

        return response()->json([
            'alerts' => $alerts,
            'count' => count($alerts)
        ]);
    }
}
