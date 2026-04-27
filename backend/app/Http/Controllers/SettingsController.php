<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Setting;

class SettingsController extends Controller
{
    // Get all settings grouped by group
    public function index()
    {
        $settings = Setting::all()->groupBy('group');
        return response()->json($settings);
    }

    // Update or Create settings
    public function update(Request $request)
    {
        $data = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
            'settings.*.group' => 'sometimes|string'
        ]);

        foreach ($data['settings'] as $item) {
            Setting::updateOrCreate(
                ['key' => $item['key']],
                [
                    'value' => $item['value'] ?? null,
                    'group' => $item['group'] ?? 'general',
                    'type' => gettype($item['value'])
                ]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
    
    // Seed/Reset Defaults (Helper)
    public function seedDefaults() {
        $defaults = [
            // Appearance
            ['key' => 'theme', 'value' => 'light', 'group' => 'appearance'],
            ['key' => 'font_size', 'value' => '16', 'group' => 'appearance'],
            ['key' => 'card_size', 'value' => '330x440', 'group' => 'appearance'],
            
            // Checkout
            ['key' => 'save_payment_history', 'value' => '1', 'group' => 'checkout'], // boolean encoded
            ['key' => 'payment_method_card', 'value' => '1', 'group' => 'checkout'],
            ['key' => 'payment_method_cash', 'value' => '1', 'group' => 'checkout'],
            
            // Language
            ['key' => 'region', 'value' => 'New York, USA', 'group' => 'language'],
            ['key' => 'language', 'value' => 'English', 'group' => 'language'],
            ['key' => 'predictive_text', 'value' => '1', 'group' => 'language'],
            
            // Notifications
            ['key' => 'email_order_confirm', 'value' => '1', 'group' => 'notifications'],
            ['key' => 'email_daily_reports', 'value' => '0', 'group' => 'notifications'],
            ['key' => 'email_stock_alerts', 'value' => '1', 'group' => 'notifications'],
        ];
        
        foreach ($defaults as $d) {
             Setting::firstOrCreate(['key' => $d['key']], $d);
        }
        
        return response()->json(['message' => 'Defaults seeded']);
    }
}
