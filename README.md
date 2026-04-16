 # 🏥 Système de Gestion de Clinique Médicale
### Application Web Full Stack — Laravel 11 + Angular 18
**Année universitaire 2025–2026 | Délai : 15 jours**

---

## 📁 Structure du Projet

```
app_gestion_medicale/
├── backend/          → API REST Laravel 11
├── frontend/         → Application Angular 18
└── README.md         → Ce fichier (guide complet)
```

---

## 🗓️ PLANNING — 15 JOURS

| Jours | Phase | Description |
|-------|-------|-------------|
| J1–J2 | Init Backend | Installation Laravel, BDD, Migrations |
| J3–J4 | CRUD Backend | Models, Controllers, Routes REST |
| J5–J6 | Auth JWT | Laravel Sanctum + JWT |
| J7–J8 | Init Frontend | Angular 18, Tailwind, Auth Module |
| J9–J10 | CRUD Angular | Modules Patients & Médecins |
| J11–J12 | Rendez-vous | Module RDV + Filtres |
| J13 | Dashboard | Stats + ng2-charts |
| J14 | Tests + UI | Tests, Responsive, Bug fixes |
| J15 | Livraison | GitHub, README, Démo finale |

---

# ═══════════════════════════════════════
# 🔧 PARTIE 1 — BACKEND (Laravel 11)
# ═══════════════════════════════════════

## J1–J2 : Initialisation du Backend

### Étape 1.1 — Installer Laravel 11

```bash
# Se placer dans le dossier backend
cd app_gestion_medicale/backend

# Créer le projet Laravel (dans le dossier courant)
composer create-project laravel/laravel . "^11.0"

# Vérifier l'installation
php artisan --version
```

### Étape 1.2 — Configurer la base de données

Modifier le fichier `.env` à la racine du backend :

```env
APP_NAME=GestionClinique
APP_ENV=local
APP_KEY=  # généré automatiquement
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=clinique_db
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

Créer la base de données dans MySQL :

```sql
CREATE DATABASE clinique_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Étape 1.3 — Installer les dépendances JWT

```bash
# Installer Laravel Sanctum (inclus dans Laravel 11)
php artisan install:api

# Installer tymon/jwt-auth pour les tokens JWT
composer require tymon/jwt-auth

# Publier la config JWT
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"

# Générer la clé secrète JWT
php artisan jwt:secret
```

### Étape 1.4 — Créer les Migrations

```bash
# Créer les fichiers de migration
php artisan make:migration create_users_table --create=users
php artisan make:migration create_patients_table --create=patients
php artisan make:migration create_medecins_table --create=medecins
php artisan make:migration create_rendez_vous_table --create=rendez_vous
```

**Migration : `create_users_table`**

```php
// database/migrations/xxxx_create_users_table.php
public function up(): void
{
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('username')->unique();
        $table->string('email')->unique();
        $table->string('password');
        $table->enum('role', ['ADMIN', 'USER', 'MEDECIN'])->default('USER');
        $table->timestamps();
    });
}
```

**Migration : `create_patients_table`**

```php
// database/migrations/xxxx_create_patients_table.php
public function up(): void
{
    Schema::create('patients', function (Blueprint $table) {
        $table->id();
        $table->string('nom');
        $table->string('prenom');
        $table->date('date_naissance');
        $table->string('cin')->unique();
        $table->string('email')->nullable();
        $table->string('telephone');
        $table->enum('sexe', ['M', 'F']);
        $table->string('groupe_sanguin')->nullable();
        $table->text('antecedents')->nullable();
        $table->timestamps();
    });
}
```

**Migration : `create_medecins_table`**

```php
// database/migrations/xxxx_create_medecins_table.php
public function up(): void
{
    Schema::create('medecins', function (Blueprint $table) {
        $table->id();
        $table->string('nom');
        $table->string('prenom');
        $table->string('specialite');
        $table->string('email')->unique();
        $table->string('telephone');
        $table->string('matricule')->unique();
        $table->boolean('disponible')->default(true);
        $table->timestamps();
    });
}
```

**Migration : `create_rendez_vous_table`**

```php
// database/migrations/xxxx_create_rendez_vous_table.php
public function up(): void
{
    Schema::create('rendez_vous', function (Blueprint $table) {
        $table->id();
        $table->dateTime('date_heure');
        $table->enum('statut', ['EN_ATTENTE', 'CONFIRME', 'ANNULE', 'TERMINE'])
              ->default('EN_ATTENTE');
        $table->string('motif');
        $table->text('notes')->nullable();
        $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
        $table->foreignId('medecin_id')->constrained('medecins')->onDelete('cascade');
        $table->timestamps();
    });
}
```

Lancer les migrations :

```bash
php artisan migrate
```

---

## J3–J4 : CRUD Backend

### Étape 2.1 — Créer les Models

```bash
php artisan make:model Patient
php artisan make:model Medecin
php artisan make:model RendezVous
```

**Model Patient** (`app/Models/Patient.php`) :

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'nom', 'prenom', 'date_naissance', 'cin',
        'email', 'telephone', 'sexe', 'groupe_sanguin', 'antecedents'
    ];

    protected $casts = [
        'date_naissance' => 'date',
    ];

    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class, 'patient_id');
    }
}
```

**Model Medecin** (`app/Models/Medecin.php`) :

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medecin extends Model
{
    protected $fillable = [
        'nom', 'prenom', 'specialite', 'email',
        'telephone', 'matricule', 'disponible'
    ];

    protected $casts = [
        'disponible' => 'boolean',
    ];

    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class, 'medecin_id');
    }
}
```

**Model RendezVous** (`app/Models/RendezVous.php`) :

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RendezVous extends Model
{
    protected $table = 'rendez_vous';

    protected $fillable = [
        'date_heure', 'statut', 'motif', 'notes',
        'patient_id', 'medecin_id'
    ];

    protected $casts = [
        'date_heure' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function medecin()
    {
        return $this->belongsTo(Medecin::class, 'medecin_id');
    }
}
```

### Étape 2.2 — Créer les Controllers

```bash
php artisan make:controller Api/PatientController --api
php artisan make:controller Api/MedecinController --api
php artisan make:controller Api/RendezVousController --api
php artisan make:controller Api/AuthController
php artisan make:controller Api/DashboardController
```

**PatientController** (`app/Http/Controllers/Api/PatientController.php`) :

```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    // GET /api/patients?page=0&size=10&sortBy=nom
    public function index(Request $request)
    {
        $size = $request->get('size', 10);
        $sortBy = $request->get('sortBy', 'nom');

        $patients = Patient::orderBy($sortBy)
            ->paginate($size);

        return response()->json($patients);
    }

    // GET /api/patients/search?keyword=ali&page=0
    public function search(Request $request)
    {
        $keyword = $request->get('keyword', '');
        $size = $request->get('size', 10);

        $patients = Patient::where('nom', 'LIKE', "%{$keyword}%")
            ->orWhere('prenom', 'LIKE', "%{$keyword}%")
            ->orWhere('cin', 'LIKE', "%{$keyword}%")
            ->orWhere('email', 'LIKE', "%{$keyword}%")
            ->paginate($size);

        return response()->json($patients);
    }

    // GET /api/patients/{id}
    public function show($id)
    {
        $patient = Patient::findOrFail($id);
        return response()->json($patient);
    }

    // POST /api/patients
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'date_naissance' => 'required|date',
            'cin'            => 'required|string|unique:patients',
            'email'          => 'nullable|email|unique:patients',
            'telephone'      => 'required|string|max:20',
            'sexe'           => 'required|in:M,F',
            'groupe_sanguin' => 'nullable|string|max:5',
            'antecedents'    => 'nullable|string',
        ]);

        $patient = Patient::create($validated);
        return response()->json($patient, 201);
    }

    // PUT /api/patients/{id}
    public function update(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'date_naissance' => 'required|date',
            'cin'            => 'required|string|unique:patients,cin,' . $id,
            'email'          => 'nullable|email|unique:patients,email,' . $id,
            'telephone'      => 'required|string|max:20',
            'sexe'           => 'required|in:M,F',
            'groupe_sanguin' => 'nullable|string|max:5',
            'antecedents'    => 'nullable|string',
        ]);

        $patient->update($validated);
        return response()->json($patient);
    }

    // DELETE /api/patients/{id}
    public function destroy($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete();
        return response()->json(null, 204);
    }
}
```

**MedecinController** (`app/Http/Controllers/Api/MedecinController.php`) :

```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medecin;
use Illuminate\Http\Request;

class MedecinController extends Controller
{
    public function index(Request $request)
    {
        $size = $request->get('size', 10);
        $medecins = Medecin::paginate($size);
        return response()->json($medecins);
    }

    public function search(Request $request)
    {
        $keyword = $request->get('keyword', '');
        $size = $request->get('size', 10);

        $medecins = Medecin::where('nom', 'LIKE', "%{$keyword}%")
            ->orWhere('prenom', 'LIKE', "%{$keyword}%")
            ->orWhere('specialite', 'LIKE', "%{$keyword}%")
            ->paginate($size);

        return response()->json($medecins);
    }

    public function show($id)
    {
        return response()->json(Medecin::findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'        => 'required|string|max:100',
            'prenom'     => 'required|string|max:100',
            'specialite' => 'required|string|max:100',
            'email'      => 'required|email|unique:medecins',
            'telephone'  => 'required|string|max:20',
            'matricule'  => 'required|string|unique:medecins',
            'disponible' => 'boolean',
        ]);

        return response()->json(Medecin::create($validated), 201);
    }

    public function update(Request $request, $id)
    {
        $medecin = Medecin::findOrFail($id);

        $validated = $request->validate([
            'nom'        => 'required|string|max:100',
            'prenom'     => 'required|string|max:100',
            'specialite' => 'required|string|max:100',
            'email'      => 'required|email|unique:medecins,email,' . $id,
            'telephone'  => 'required|string|max:20',
            'matricule'  => 'required|string|unique:medecins,matricule,' . $id,
            'disponible' => 'boolean',
        ]);

        $medecin->update($validated);
        return response()->json($medecin);
    }

    public function destroy($id)
    {
        Medecin::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
```

**RendezVousController** (`app/Http/Controllers/Api/RendezVousController.php`) :

```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RendezVous;
use Illuminate\Http\Request;

class RendezVousController extends Controller
{
    public function index(Request $request)
    {
        $size    = $request->get('size', 10);
        $statut  = $request->get('statut');
        $medecinId = $request->get('medecinId');

        $query = RendezVous::with(['patient', 'medecin']);

        if ($statut)    $query->where('statut', $statut);
        if ($medecinId) $query->where('medecin_id', $medecinId);

        return response()->json($query->orderBy('date_heure', 'desc')->paginate($size));
    }

    public function show($id)
    {
        return response()->json(
            RendezVous::with(['patient', 'medecin'])->findOrFail($id)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date_heure' => 'required|date',
            'statut'     => 'required|in:EN_ATTENTE,CONFIRME,ANNULE,TERMINE',
            'motif'      => 'required|string|max:255',
            'notes'      => 'nullable|string',
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'required|exists:medecins,id',
        ]);

        $rdv = RendezVous::create($validated);
        return response()->json($rdv->load(['patient', 'medecin']), 201);
    }

    public function update(Request $request, $id)
    {
        $rdv = RendezVous::findOrFail($id);

        $validated = $request->validate([
            'date_heure' => 'required|date',
            'statut'     => 'required|in:EN_ATTENTE,CONFIRME,ANNULE,TERMINE',
            'motif'      => 'required|string|max:255',
            'notes'      => 'nullable|string',
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'required|exists:medecins,id',
        ]);

        $rdv->update($validated);
        return response()->json($rdv->load(['patient', 'medecin']));
    }

    public function destroy($id)
    {
        RendezVous::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
```

**DashboardController** (`app/Http/Controllers/Api/DashboardController.php`) :

```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Medecin;
use App\Models\RendezVous;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = Carbon::today();

        return response()->json([
            'totalPatients'   => Patient::count(),
            'totalMedecins'   => Medecin::count(),
            'totalRdv'        => RendezVous::count(),
            'rdvEnAttente'    => RendezVous::where('statut', 'EN_ATTENTE')->count(),
            'rdvConfirme'     => RendezVous::where('statut', 'CONFIRME')->count(),
            'rdvAnnule'       => RendezVous::where('statut', 'ANNULE')->count(),
            'rdvTermine'      => RendezVous::where('statut', 'TERMINE')->count(),
            'rdvAujourdhui'   => RendezVous::whereDate('date_heure', $today)->count(),
            'rdvAVenir'       => RendezVous::where('date_heure', '>', now())->count(),
        ]);
    }
}
```

---

## J5–J6 : Authentification JWT

### Étape 3.1 — Configurer le Model User pour JWT

Modifier `app/Models/User.php` :

```php
<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    protected $fillable = ['username', 'email', 'password', 'role'];

    protected $hidden = ['password'];

    protected $casts = ['password' => 'hashed'];

    // Requis par JWTSubject
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return ['role' => $this->role];
    }
}
```

### Étape 3.2 — AuthController

```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // POST /api/auth/register
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|unique:users',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role'     => 'in:ADMIN,USER,MEDECIN',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role'] ?? 'USER',
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Compte créé avec succès',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    // POST /api/auth/login
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Chercher l'utilisateur par username
        $user = User::where('username', $credentials['username'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'token' => $token,
            'user'  => $user,
        ]);
    }

    // POST /api/auth/logout
    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    // GET /api/auth/me
    public function me()
    {
        return response()->json(auth()->user());
    }
}
```

### Étape 3.3 — Configurer les Routes API

Modifier `routes/api.php` :

```php
<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\MedecinController;
use App\Http\Controllers\Api\RendezVousController;
use App\Http\Controllers\Api\DashboardController;

// Routes publiques (authentification)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Routes protégées par JWT
Route::middleware('auth:api')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Patients
    Route::get('/patients/search', [PatientController::class, 'search']);
    Route::apiResource('/patients', PatientController::class);

    // Médecins
    Route::get('/medecins/search', [MedecinController::class, 'search']);
    Route::apiResource('/medecins', MedecinController::class);

    // Rendez-vous
    Route::apiResource('/rdv', RendezVousController::class);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
});
```

### Étape 3.4 — Configurer auth.php

Dans `config/auth.php`, modifier le guard par défaut :

```php
'defaults' => [
    'guard'     => 'api',
    'passwords' => 'users',
],

'guards' => [
    'api' => [
        'driver'   => 'jwt',
        'provider' => 'users',
    ],
],
```

### Étape 3.5 — Configurer CORS

Dans `config/cors.php` :

```php
return [
    'paths'               => ['api/*'],
    'allowed_methods'     => ['*'],
    'allowed_origins'     => ['http://localhost:4200'],
    'allowed_headers'     => ['*'],
    'exposed_headers'     => [],
    'max_age'             => 0,
    'supports_credentials' => false,
];
```

### Étape 3.6 — Tester avec Postman

```
POST http://localhost:8000/api/auth/register
Body JSON:
{
  "username": "admin",
  "email": "admin@clinique.com",
  "password": "password123",
  "role": "ADMIN"
}

POST http://localhost:8000/api/auth/login
Body JSON:
{
  "username": "admin",
  "password": "password123"
}
→ Récupérer le token JWT

GET http://localhost:8000/api/patients
Header: Authorization: Bearer {token}
```

Lancer le serveur backend :

```bash
cd backend
php artisan serve
# API disponible sur http://localhost:8000
```

---

# ═══════════════════════════════════════
# 🅰️ PARTIE 2 — FRONTEND (Angular 18)
# ═══════════════════════════════════════

## J7–J8 : Initialisation du Frontend

### Étape 4.1 — Créer le projet Angular 18

```bash
cd app_gestion_medicale/frontend

# Installer Angular CLI si nécessaire
npm install -g @angular/cli@18

# Créer le projet
ng new . --routing=true --style=css --standalone=true

# Installer les dépendances
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

npm install @angular/material@18
npm install ng2-charts chart.js
npm install @auth0/angular-jwt
```

### Étape 4.2 — Configurer Tailwind CSS

Modifier `tailwind.config.js` :

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#0ea5e9',
      }
    },
  },
  plugins: [],
}
```

Dans `src/styles.css` :

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Étape 4.3 — Structure des fichiers Angular

```
src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── patient.service.ts
│   │   ├── medecin.service.ts
│   │   ├── rendez-vous.service.ts
│   │   └── dashboard.service.ts
│   ├── interceptors/
│   │   └── jwt.interceptor.ts
│   └── guards/
│       └── auth.guard.ts
├── modules/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── patients/
│   │   ├── patient-list/
│   │   ├── patient-form/
│   │   └── patient-detail/
│   ├── medecins/
│   │   ├── medecin-list/
│   │   └── medecin-form/
│   ├── rendez-vous/
│   │   ├── rdv-list/
│   │   └── rdv-form/
│   └── dashboard/
│       └── dashboard/
└── shared/
    ├── components/
    │   ├── pagination/
    │   ├── search-bar/
    │   └── confirm-dialog/
    └── models/
        ├── patient.model.ts
        ├── medecin.model.ts
        ├── rendez-vous.model.ts
        └── page.model.ts
```

### Étape 4.4 — Définir les interfaces TypeScript

**`src/app/shared/models/page.model.ts`** :

```typescript
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
```

**`src/app/shared/models/patient.model.ts`** :

```typescript
export interface Patient {
  id?: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  cin: string;
  email?: string;
  telephone: string;
  sexe: 'M' | 'F';
  groupeSanguin?: string;
  antecedents?: string;
}
```

**`src/app/shared/models/medecin.model.ts`** :

```typescript
export interface Medecin {
  id?: number;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
  matricule: string;
  disponible: boolean;
}
```

**`src/app/shared/models/rendez-vous.model.ts`** :

```typescript
export type StatutRdv = 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE';

export interface RendezVous {
  id?: number;
  dateHeure: string;
  statut: StatutRdv;
  motif: string;
  notes?: string;
  patientId: number;
  medecinId: number;
  patient?: any;
  medecin?: any;
}
```

### Étape 4.5 — JWT Interceptor

**`src/app/core/interceptors/jwt.interceptor.ts`** :

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq);
  }
  
  return next(req);
};
```

### Étape 4.6 — AuthGuard

**`src/app/core/guards/auth.guard.ts`** :

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};
```

### Étape 4.7 — AuthService

**`src/app/core/services/auth.service.ts`** :

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/auth';
  private isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.isLoggedIn$.next(true);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
```

### Étape 4.8 — PatientService

**`src/app/core/services/patient.service.ts`** :

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../../shared/models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private apiUrl = 'http://localhost:8000/api/patients';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, sortBy = 'nom'): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy);
    return this.http.get(this.apiUrl, { params });
  }

  search(keyword: string, page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page)
      .set('size', size);
    return this.http.get(`${this.apiUrl}/search`, { params });
  }

  getById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  create(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient);
  }

  update(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### Étape 4.9 — Configuration du routing (app.routes.ts)

**`src/app/app.routes.ts`** :

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  { path: 'login',    loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./modules/auth/register/register.component').then(m => m.RegisterComponent) },
  
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'patients',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/patients/patient-list/patient-list.component').then(m => m.PatientListComponent)
  },
  {
    path: 'medecins',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/medecins/medecin-list/medecin-list.component').then(m => m.MedecinListComponent)
  },
  {
    path: 'rendez-vous',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/rendez-vous/rdv-list/rdv-list.component').then(m => m.RdvListComponent)
  },
  
  { path: '**', redirectTo: '/dashboard' }
];
```

### Étape 4.10 — Configurer app.config.ts

**`src/app/app.config.ts`** :

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimations(),
  ]
};
```

---

## J9–J10 : Module Patients & Médecins

### Étape 5.1 — Composant Login

Générer et coder le composant :

```bash
ng generate component modules/auth/login --standalone
```

**`login.component.ts`** :

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.message || 'Erreur de connexion';
        this.loading = false;
      }
    });
  }
}
```

**`login.component.html`** :

```html
<div class="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center">
  <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
    
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-blue-900">🏥 Clinique</h1>
      <p class="text-gray-500 mt-2">Connectez-vous à votre espace</p>
    </div>

    <div *ngIf="error" class="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
      {{ error }}
    </div>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
        <input formControlName="username" type="text"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Votre username" />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
        <input formControlName="password" type="password"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="••••••••" />
      </div>

      <button type="submit" [disabled]="loading || loginForm.invalid"
        class="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>

    <p class="text-center mt-4 text-sm text-gray-600">
      Pas de compte ?
      <a routerLink="/register" class="text-blue-600 font-semibold hover:underline">S'inscrire</a>
    </p>
  </div>
</div>
```

### Étape 5.2 — Composant Patient List

```bash
ng generate component modules/patients/patient-list --standalone
```

**`patient-list.component.ts`** :

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../shared/models/patient.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './patient-list.component.html',
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;

  searchControl = new FormControl('');
  searchKeyword = '';

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();

    // Recherche avec debounce RxJS
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(keyword => {
      this.searchKeyword = keyword || '';
      this.currentPage = 0;
      this.loadPatients();
    });
  }

  loadPatients(): void {
    const obs = this.searchKeyword
      ? this.patientService.search(this.searchKeyword, this.currentPage, this.pageSize)
      : this.patientService.getAll(this.currentPage, this.pageSize);

    obs.subscribe((data: any) => {
      this.patients = data.data || data.content || [];
      this.totalElements = data.total || data.totalElements || 0;
      this.totalPages = data.last_page || data.totalPages || 0;
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPatients();
  }

  deletePatient(id: number): void {
    if (confirm('Supprimer ce patient ?')) {
      this.patientService.delete(id).subscribe(() => this.loadPatients());
    }
  }
}
```

---

## J11–J12 : Module Rendez-vous

### Étape 6.1 — RendezVousService

```typescript
// src/app/core/services/rendez-vous.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RendezVousService {
  private apiUrl = 'http://localhost:8000/api/rdv';

  constructor(private http: HttpClient) {}

  getAll(filters: any = {}, page = 0, size = 10): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters.statut)    params = params.set('statut', filters.statut);
    if (filters.medecinId) params = params.set('medecinId', filters.medecinId);
    return this.http.get(this.apiUrl, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(rdv: any): Observable<any> {
    return this.http.post(this.apiUrl, rdv);
  }

  update(id: number, rdv: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, rdv);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

---

## J13 : Dashboard

### Étape 7.1 — DashboardService

```typescript
// src/app/core/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getStats() {
    return this.http.get<any>('http://localhost:8000/api/dashboard/stats');
  }
}
```

### Étape 7.2 — Composant Dashboard avec Chart.js

```bash
ng generate component modules/dashboard/dashboard --standalone
```

**`dashboard.component.ts`** :

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats: any = {};

  // Graphique camembert — Statuts RDV
  pieChartData: ChartData<'pie'> = {
    labels: ['En attente', 'Confirmé', 'Annulé', 'Terminé'],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['#f59e0b', '#22c55e', '#ef4444', '#6366f1'] }]
  };

  // Graphique barres — Vue d'ensemble
  barChartData: ChartData<'bar'> = {
    labels: ['Patients', 'Médecins', 'RDV Total'],
    datasets: [{ data: [0, 0, 0], label: 'Statistiques', backgroundColor: '#3b82f6' }]
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe(data => {
      this.stats = data;
      // Mettre à jour les graphiques
      this.pieChartData.datasets[0].data = [
        data.rdvEnAttente, data.rdvConfirme, data.rdvAnnule, data.rdvTermine
      ];
      this.barChartData.datasets[0].data = [
        data.totalPatients, data.totalMedecins, data.totalRdv
      ];
    });
  }
}
```

**`dashboard.component.html`** :

```html
<div class="p-6">
  <h1 class="text-2xl font-bold text-gray-800 mb-6">📊 Tableau de bord</h1>

  <!-- Cartes KPI -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div class="bg-blue-600 text-white rounded-xl p-5 shadow">
      <p class="text-sm opacity-80">Total Patients</p>
      <p class="text-4xl font-bold mt-1">{{ stats.totalPatients }}</p>
    </div>
    <div class="bg-green-600 text-white rounded-xl p-5 shadow">
      <p class="text-sm opacity-80">Total Médecins</p>
      <p class="text-4xl font-bold mt-1">{{ stats.totalMedecins }}</p>
    </div>
    <div class="bg-purple-600 text-white rounded-xl p-5 shadow">
      <p class="text-sm opacity-80">RDV Aujourd'hui</p>
      <p class="text-4xl font-bold mt-1">{{ stats.rdvAujourdhui }}</p>
    </div>
    <div class="bg-amber-500 text-white rounded-xl p-5 shadow">
      <p class="text-sm opacity-80">RDV En attente</p>
      <p class="text-4xl font-bold mt-1">{{ stats.rdvEnAttente }}</p>
    </div>
  </div>

  <!-- Graphiques -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="bg-white rounded-xl shadow p-5">
      <h2 class="text-lg font-semibold mb-4 text-gray-700">Statuts des rendez-vous</h2>
      <canvas baseChart [data]="pieChartData" type="pie"></canvas>
    </div>
    <div class="bg-white rounded-xl shadow p-5">
      <h2 class="text-lg font-semibold mb-4 text-gray-700">Vue d'ensemble</h2>
      <canvas baseChart [data]="barChartData" type="bar"></canvas>
    </div>
  </div>
</div>
```

---

## J14 : Tests & UI

### Tests à effectuer

```bash
# Backend — Postman
✅ POST /api/auth/register → 201
✅ POST /api/auth/login    → 200 + token JWT
✅ GET  /api/patients      → 200 (avec Authorization header)
✅ POST /api/patients      → 201 (créer un patient)
✅ PUT  /api/patients/{id} → 200 (modifier)
✅ DELETE /api/patients/{id} → 204
✅ GET /api/dashboard/stats → 200

# Frontend Angular
✅ Login → stockage token → redirection dashboard
✅ Navigation protégée (sans token → /login)
✅ CRUD patients : liste, ajouter, éditer, supprimer
✅ Recherche avec debounce
✅ Pagination fonctionnelle
✅ Graphiques dashboard affichés
✅ Responsive mobile (sm: md: lg:)
```

---

## J15 : Livraison

### Étape 9.1 — Préparer GitHub

```bash
# Dans app_gestion_medicale/
git init
git add .
git commit -m "Initial commit — Système Gestion Clinique"
git remote add origin https://github.com/VOTRE_USERNAME/clinique-medicale
git push -u origin main
```

### Étape 9.2 — Script SQL de la base de données

```bash
# Exporter la structure de la base
mysqldump -u root -p clinique_db --no-data > database/schema.sql

# Exporter avec données de test
mysqldump -u root -p clinique_db > database/full_dump.sql
```

### Étape 9.3 — Données de test (Seeder Laravel)

```bash
php artisan make:seeder DatabaseSeeder
```

Dans `database/seeders/DatabaseSeeder.php` :

```php
public function run(): void
{
    // Créer un admin
    User::create([
        'username' => 'admin',
        'email'    => 'admin@clinique.com',
        'password' => Hash::make('password123'),
        'role'     => 'ADMIN',
    ]);

    // Quelques médecins
    Medecin::create([
        'nom' => 'Diallo', 'prenom' => 'Moussa',
        'specialite' => 'Cardiologie', 'email' => 'diallo@clinique.com',
        'telephone' => '0700000001', 'matricule' => 'MED001', 'disponible' => true
    ]);

    // Quelques patients
    Patient::create([
        'nom' => 'Ba', 'prenom' => 'Fatou',
        'date_naissance' => '1990-05-15', 'cin' => 'SN12345678',
        'email' => 'fatou@email.com', 'telephone' => '0700000002',
        'sexe' => 'F', 'groupe_sanguin' => 'A+'
    ]);
}
```

```bash
php artisan db:seed
```

---

## ✅ Checklist Finale de Livraison

### Backend ✅
- [ ] Laravel 11 installé et configuré
- [ ] Base de données MySQL connectée + migrations
- [ ] Models : Patient, Médecin, RendezVous, User
- [ ] CRUD complet pour les 3 entités
- [ ] Pagination + recherche multi-champs
- [ ] Auth JWT (register, login, logout)
- [ ] Endpoints protégés (401 sans token)
- [ ] CORS configuré pour localhost:4200
- [ ] Testé sur Postman

### Frontend ✅
- [ ] Angular 18 + Tailwind CSS configurés
- [ ] JWT Interceptor actif
- [ ] AuthGuard fonctionnel
- [ ] Module Auth (login/register)
- [ ] Module Patients (liste paginée + CRUD)
- [ ] Module Médecins (liste + filtrage + CRUD)
- [ ] Module Rendez-vous (filtres multi-critères + statuts)
- [ ] Dashboard (cartes KPI + 2 graphiques Chart.js)
- [ ] Recherche avec debounceTime RxJS
- [ ] Responsive Tailwind (sm: md: lg:)

### Livrable ✅
- [ ] Code sur GitHub (README.md inclus)
- [ ] Script SQL base de données
- [ ] Captures d'écran
- [ ] Rapport technique

---

## 🚀 Commandes de Lancement

```bash
# Backend
cd app_gestion_medicale/backend
php artisan serve
# → http://localhost:8000

# Frontend
cd app_gestion_medicale/frontend
ng serve
# → http://localhost:4200
```

---

## 📚 Ressources Utiles

| Technologie | Lien |
|-------------|------|
| Laravel 11 | https://laravel.com/docs/11.x |
| JWT Auth (tymon) | https://jwt-auth.readthedocs.io |
| Angular 18 | https://angular.dev |
| Tailwind CSS | https://tailwindcss.com/docs |
| ng2-charts | https://valor-software.com/ng2-charts |
| Postman | https://www.postman.com/downloads |
| JWT.io | https://jwt.io |

---

*Projet Master — Gestion de Clinique Médicale | 2025–2026*
