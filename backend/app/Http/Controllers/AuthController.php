<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        $googleUser = Socialite::driver('google')->user();

        $supplier = Supplier::where('email', $googleUser->getEmail())->first();

        if (!$supplier) {
            return redirect('/login')->with('error', 'Your account is not authorized. Contact Bunaroots to request access.');
        }

        $supplier->update([
            'google_id' => $googleUser->getId(),
            'name'      => $googleUser->getName(),
            'avatar'    => $googleUser->getAvatar(),
        ]);

        session(['supplier_id' => $supplier->id]);

        return redirect('/dashboard');
    }

    public function logout(Request $request)
    {
        $request->session()->forget('supplier_id');
        return redirect('/login');
    }
}
