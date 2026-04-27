<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@rms.com',
            'password' => Hash::make('password'),
            'role' => 'admin', // Ensure you add 'role' column to users table first or handle this
        ]);

        // Cashier
        User::create([
            'name' => 'Cashier Staff',
            'email' => 'cashier@rms.com',
            'password' => Hash::make('password'),
            'role' => 'cashier',
        ]);

        // Kitchen
        User::create([
            'name' => 'Kitchen Staff',
            'email' => 'kitchen@rms.com',
            'password' => Hash::make('password'),
            'role' => 'kitchen',
        ]);
    }
}
