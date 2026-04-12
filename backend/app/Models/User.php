<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'email',
        'password',
        'role',
        'photo_profil',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['photo_url'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getPhotoUrlAttribute()
    {
        if ($this->photo_profil) {
            return asset('storage/' . $this->photo_profil);
        }
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->username) . '&background=6366f1&color=fff';
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return ['role' => $this->role];
    }

    /**
     * Relation : Un User MEDECIN est lié à un Medecin
     */
    public function medecin()
    {
        return $this->hasOne(Medecin::class, 'user_id');
    }

    /**
     * Relation : Un User (patient) est lié à un Patient
     */
    public function patient()
    {
        return $this->hasOne(Patient::class, 'user_id');
    }
}
