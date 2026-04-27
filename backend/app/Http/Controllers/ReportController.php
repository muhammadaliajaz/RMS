<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Ingredient;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $period = $request->query('period', 'today'); // today, yesterday, week, month
        
        $now = Carbon::now();
        
        if ($period == 'yesterday') {
            $startDate = Carbon::yesterday()->startOfDay();
            $endDate = Carbon::yesterday()->endOfDay();
        } elseif ($period == 'week') {
            $startDate = $now->copy()->startOfWeek();
            $endDate = $now->copy()->endOfWeek();
        } elseif ($period == 'month') {
            $startDate = $now->copy()->startOfMonth();
            $endDate = $now->copy()->endOfMonth();
        } else {
            // Default to Today
            $startDate = $now->copy()->startOfDay();
            $endDate = $now->copy()->endOfDay();
        }

        // 1. Total Revenue (Filtered)
        $revenue = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->sum('total_amount');

        // 2. Total Orders (Filtered)
        $ordersCount = Order::whereBetween('created_at', [$startDate, $endDate])->count();

        // 3. Low Stock Alerts (Static)
        $lowStockItems = Ingredient::whereColumn('stock', '<=', 'min_stock')->get();

        // 4. Top Selling Items (Filtered)
        $topSelling = OrderItem::whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->select('menu_item_id', DB::raw('sum(quantity) as total_sold'))
            ->with('menuItem:id,name')
            ->groupBy('menu_item_id')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // 5. Recent Orders (Filtered)
        $recentOrders = Order::with('user:id,name')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'revenue' => $revenue,
            'orders_count' => $ordersCount,
            'low_stock' => $lowStockItems,
            'top_selling' => $topSelling,
            'recent_orders' => $recentOrders,
            'period' => $period
        ]);
    }
}
