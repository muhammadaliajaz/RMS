<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Jenssegers\Agent\Agent; // Optional, or just manual parsing

class SessionController extends Controller
{
    public function index()
    {
        $sessions = DB::table('sessions')
            ->where('user_id', Auth::id())
            ->orderBy('last_activity', 'desc')
            ->get();

        return response()->json($sessions->map(function ($session) {
            return [
                'id' => $session->id,
                'ip_address' => $session->ip_address,
                'user_agent' => $session->user_agent,
                'last_activity' => $session->last_activity,
                'is_current' => $session->id === session()->getId(),
                // Simple parsing
                'device' => $this->parseUserAgent($session->user_agent),
            ];
        }));
    }

    private function parseUserAgent($ua)
    {
        $platform = 'Unknown';
        if (strpos($ua, 'Windows') !== false) $platform = 'Windows';
        elseif (strpos($ua, 'Macintosh') !== false) $platform = 'Mac';
        elseif (strpos($ua, 'Linux') !== false) $platform = 'Linux';
        elseif (strpos($ua, 'iPhone') !== false) $platform = 'iPhone';
        elseif (strpos($ua, 'Android') !== false) $platform = 'Android';

        $browser = 'Browser';
        if (strpos($ua, 'Chrome') !== false) $browser = 'Chrome';
        elseif (strpos($ua, 'Firefox') !== false) $browser = 'Firefox';
        elseif (strpos($ua, 'Safari') !== false) $browser = 'Safari';
        elseif (strpos($ua, 'Edge') !== false) $browser = 'Edge';

        return "$platform • $browser";
    }
}
