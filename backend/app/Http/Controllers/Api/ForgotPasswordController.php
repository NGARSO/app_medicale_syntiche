<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ForgotPasswordController extends Controller
{
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Nous ne trouvons pas d\'utilisateur avec cette adresse e-mail.'], 404);
        }

        $token = \Illuminate\Support\Str::random(60);

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => \Illuminate\Support\Facades\Hash::make($token), 'created_at' => now()]
        );

        // Envoyer l'email (Simulé ou réel selon .env)
        try {
            \Illuminate\Support\Facades\Mail::raw("Votre jeton de réinitialisation est : $token", function ($message) use ($request) {
                $message->to($request->email)->subject('Réinitialisation de mot de passe');
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Erreur d'envoi d'email: " . $e->getMessage());
        }

        return response()->json(['message' => 'Lien de réinitialisation envoyé !']);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !\Illuminate\Support\Facades\Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Lien ou jeton invalide.'], 400);
        }

        $user = \App\Models\User::where('email', $request->email)->first();
        $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        $user->save();

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès !']);
    }
}
