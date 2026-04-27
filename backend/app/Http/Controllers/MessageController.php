<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $otherUserId = $request->query('contact_id');
        $type = $request->query('type', 'personal');

        if ($type === 'team') {
            // Fetch all Team messages (simplified: assumption is global 'team' chat or group_id logic needed)
            // For this demo, we'll assume a single 'Waiter Team' which is type='team'
            return Message::with('sender')
                ->where('type', 'team')
                ->orderBy('created_at', 'asc')
                ->get();
        } else {
            // Personal Chat
            return Message::with('sender')
                ->where(function ($q) use ($userId, $otherUserId) {
                    $q->where('sender_id', $userId)->where('receiver_id', $otherUserId);
                })
                ->orWhere(function ($q) use ($userId, $otherUserId) {
                    $q->where('sender_id', $otherUserId)->where('receiver_id', $userId);
                })
                ->orderBy('created_at', 'asc')
                ->get();
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'type' => 'required|in:personal,team',
            'receiver_id' => 'required_if:type,personal|exists:users,id|nullable'
        ]);

        $msg = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'type' => $request->type,
            'message' => $request->message
        ]);

        return response()->json($msg->load('sender'), 201);
    }

    public function getContacts(Request $request)
    {
        $userId = Auth::id();
        $users = \App\Models\User::where('id', '!=', $userId)->get();

        $contacts = $users->map(function ($user) use ($userId) {
            // Get last message between me and this user
            $lastMsg = Message::where(function ($q) use ($userId, $user) {
                $q->where('sender_id', $userId)->where('receiver_id', $user->id);
            })->orWhere(function ($q) use ($userId, $user) {
                $q->where('sender_id', $user->id)->where('receiver_id', $userId);
            })->orderBy('created_at', 'desc')->first();

            // Count unread from this user to me
            $unread = Message::where('sender_id', $user->id)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'Staff',
                'avatar' => "https://ui-avatars.com/api/?name={$user->name}&background=random",
                'lastMessage' => $lastMsg ? ($lastMsg->sender_id == $userId ? 'You: ' : '') . $lastMsg->message : 'Tap to chat',
                'time' => $lastMsg ? $lastMsg->created_at->diffForHumans() : '',
                'unread' => $unread,
                'type' => 'personal'
            ];
        });

        // Sort by last message time (descending) so active chats are top
        return $contacts->sortByDesc(function ($c) {
             return $c['time'] ? 1 : 0; // Simplified sort, practically might need raw timestamp
        })->values();
    }

    public function markAsRead(Request $request)
    {
        $request->validate([
            'sender_id' => 'required|exists:users,id'
        ]);

        $userId = Auth::id();
        $senderId = $request->sender_id;

        Message::where('sender_id', $senderId)
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Messages marked as read']);
    }
}
