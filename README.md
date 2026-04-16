# Système de Gestion de Clinique Médicale

> Application Web Full Stack — Laravel 11 · Angular 18 · JWT  
> Projet Master Informatique — Année universitaire 2025–2026

---

## Sommaire

- [Présentation](#présentation)
- [Stack technologique](#stack-technologique)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancement](#lancement)
- [API Reference](#api-reference)
- [Structure du projet](#structure-du-projet)
- [Authentification JWT](#authentification-jwt)
- [Tests](#tests)
- [Ressources](#ressources)
- [Auteur](#auteur)

---

## Présentation

Application web complète pour la gestion d'une clinique médicale : patients, médecins, rendez-vous et statistiques. Développée en 15 jours selon une architecture REST séparant frontend et backend.

**Fonctionnalités principales :**

- Gestion des **patients** — CRUD complet avec recherche multi-champs
- Gestion des **médecins** — CRUD avec filtrage par spécialité
- Gestion des **rendez-vous** — suivi des statuts (EN_ATTENTE / CONFIRME / ANNULE / TERMINE)
- **Authentification sécurisée** — JWT (JSON Web Token)
- **Recherche & pagination** — debounce RxJS côté Angular
- **Dashboard statistiques** — graphiques Chart.js en temps réel

---

## Stack technologique

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| Angular | 18 | Framework SPA |
| Tailwind CSS | 3.4 | Styling responsive |
| Angular Material | 18 | Composants UI |
| Chart.js / ng2-charts | latest | Graphiques dashboard |
| TypeScript | 5.x | Typage statique |
| RxJS | 7.x | Gestion asynchrone |

### Backend

| Technologie | Version | Rôle |
|---|---|---|
| Laravel | 11 | API REST |
| PHP | 8.2+ | Langage serveur |
| MySQL | 8.x | Base de données |
| tymon/jwt-auth | latest | Authentification JWT |
| Eloquent ORM | — | Gestion base de données |

---

## Architecture

```
app_gestion_medicale/
├── backend/          → API REST Laravel 11 (port 8000)
├── frontend/         → Application Angular 18 (port 4200)
└── README.md
```

### Modèle de données

```
User          Patient         Medecin
─────         ───────         ───────
id            id              id
username      nom             nom
email         prenom          prenom
password      dateNaissance   specialite
role          cin             email
              email           telephone
              telephone       matricule
              sexe            disponible
              groupeSanguin
              antecedents

RendezVous
──────────
id
dateHeure
statut (EN_ATTENTE | CONFIRME | ANNULE | TERMINE)
motif
notes
patient_id  →  Patient
medecin_id  →  Medecin
```

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **PHP** >= 8.2 + **Composer**
- **Node.js** >= 20 LTS + **npm**
- **MySQL** >= 8.0
- **Angular CLI** 18 — `npm install -g @angular/cli@18`

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/VOTRE_USERNAME/clinique-medicale.git
cd clinique-medicale
```

### 2. Backend — Laravel 11

```bash
cd backend

# Installer les dépendances PHP
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé applicative
php artisan key:generate
```

Modifier `.env` avec vos paramètres de base de données :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=clinique_db
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

Créer la base de données puis lancer les migrations :

```sql
CREATE DATABASE clinique_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
# Migrations + clé JWT + données de test
php artisan migrate
php artisan jwt:secret
php artisan db:seed
```

### 3. Frontend — Angular 18

```bash
cd ../frontend

# Installer les dépendances Node.js
npm install
```

---

## Lancement

Ouvrir **deux terminaux** et lancer simultanément :

```bash
# Terminal 1 — Backend
cd backend
php artisan serve
# API disponible sur http://localhost:8000
```

```bash
# Terminal 2 — Frontend
cd frontend
ng serve
# Application disponible sur http://localhost:4200
```

> **Compte admin par défaut (seeder)**  
> Username : `admin` | Mot de passe : `password123`

---

## API Reference

Toutes les routes protégées nécessitent le header :  
`Authorization: Bearer <token_jwt>`

### Authentification

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Créer un compte |
| `POST` | `/api/auth/login` | Connexion — retourne le JWT |
| `POST` | `/api/auth/logout` | Déconnexion (protégée) |
| `GET` | `/api/auth/me` | Profil utilisateur connecté |

### Patients

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/patients?page=0&size=10&sortBy=nom` | Liste paginée |
| `GET` | `/api/patients/search?keyword=ali` | Recherche multi-champs |
| `GET` | `/api/patients/{id}` | Détail d'un patient |
| `POST` | `/api/patients` | Créer un patient |
| `PUT` | `/api/patients/{id}` | Modifier un patient |
| `DELETE` | `/api/patients/{id}` | Supprimer un patient |

### Médecins

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/medecins?page=0&size=10` | Liste paginée |
| `GET` | `/api/medecins/search?keyword=cardio` | Recherche / filtrage |
| `GET` | `/api/medecins/{id}` | Détail d'un médecin |
| `POST` | `/api/medecins` | Créer un médecin |
| `PUT` | `/api/medecins/{id}` | Modifier un médecin |
| `DELETE` | `/api/medecins/{id}` | Supprimer un médecin |

### Rendez-vous

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/rdv?page=0&size=10` | Liste paginée |
| `GET` | `/api/rdv?statut=EN_ATTENTE&medecinId=1` | Filtrage multi-critères |
| `GET` | `/api/rdv/{id}` | Détail d'un rendez-vous |
| `POST` | `/api/rdv` | Créer un rendez-vous |
| `PUT` | `/api/rdv/{id}` | Modifier / changer le statut |
| `DELETE` | `/api/rdv/{id}` | Supprimer |

### Dashboard

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Statistiques globales |

**Exemple de réponse `/api/dashboard/stats` :**

```json
{
  "totalPatients": 42,
  "totalMedecins": 8,
  "totalRdv": 156,
  "rdvEnAttente": 12,
  "rdvConfirme": 30,
  "rdvAnnule": 5,
  "rdvTermine": 109,
  "rdvAujourdhui": 6,
  "rdvAVenir": 18
}
```

---

## Structure du projet

### Backend (`/backend`)

```
app/
├── Http/Controllers/Api/
│   ├── AuthController.php
│   ├── PatientController.php
│   ├── MedecinController.php
│   ├── RendezVousController.php
│   └── DashboardController.php
├── Models/
│   ├── User.php
│   ├── Patient.php
│   ├── Medecin.php
│   └── RendezVous.php
database/
├── migrations/
└── seeders/
routes/
└── api.php
```

### Frontend (`/frontend/src/app`)

```
core/
├── services/          → AuthService, PatientService, MedecinService...
├── interceptors/      → jwt.interceptor.ts
└── guards/            → auth.guard.ts
modules/
├── auth/              → Login, Register
├── patients/          → Liste, Formulaire, Detail
├── medecins/          → Liste, Formulaire
├── rendez-vous/       → Liste, Formulaire + filtres
└── dashboard/         → KPI + graphiques
shared/
├── components/        → Pagination, SearchBar, ConfirmDialog
└── models/            → Interfaces TypeScript
```

---

## Authentification JWT

**Flux de connexion :**

```
[Angular Login Form]
        |
POST /api/auth/login
        |
[Backend vérifie username + hash BCrypt]
        |
[Génère JWT signé HS256 — expire dans 24h]
        |
[Angular stocke le token dans localStorage]
        |
[JWT Interceptor ajoute "Authorization: Bearer ..." à chaque requête]
        |
[Backend valide le token — retourne 401 si invalide]
```

**Rôles disponibles :** `ADMIN` · `USER` · `MEDECIN`

---

## Tests

Tester l'API avec [Postman](https://www.postman.com/downloads) :

```bash
# 1. S'enregistrer
POST http://localhost:8000/api/auth/register
Body: { "username": "admin", "email": "admin@test.com", "password": "password123", "role": "ADMIN" }

# 2. Se connecter — copier le token retourné
POST http://localhost:8000/api/auth/login
Body: { "username": "admin", "password": "password123" }

# 3. Utiliser le token
GET http://localhost:8000/api/patients
Header: Authorization: Bearer {votre_token}
```

---

## Ressources

| Technologie | Documentation |
|---|---|
| Laravel 11 | https://laravel.com/docs/11.x |
| JWT Auth (tymon) | https://jwt-auth.readthedocs.io |
| Angular 18 | https://angular.dev |
| Tailwind CSS | https://tailwindcss.com/docs |
| ng2-charts | https://valor-software.com/ng2-charts |
| JWT.io (debug) | https://jwt.io |

---

## Auteur

**Sosthène MOUNSAMBOTE** 
**Syntiche Lisa P NGARSO MBIMBAI**  
**Ferdinand Alexandre F Bertrand BOCANDE**   
Master Informatique — Génie Logiciel et AGL / Développement Web  
Année universitaire 2025–2026

---

*Projet académique — Système de Gestion de Clinique Médicale*