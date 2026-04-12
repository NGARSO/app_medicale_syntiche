import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo"><i class="bi bi-hospital text-primary"></i></div>
        <h1 class="auth-title">CliniquePro</h1>
        <p class="auth-subtitle">Connectez-vous à votre espace médical</p>

        <div class="alert alert-danger" *ngIf="error">
          <i class="bi bi-exclamation-triangle-fill"></i> {{ error }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Nom d'utilisateur <span class="required">*</span></label>
            <div class="search-bar">
              <i class="bi bi-person search-icon"></i>
              <input formControlName="username" type="text" class="form-control"
                [class.is-invalid]="submitted && f['username'].errors"
                placeholder="Votre identifiant" autocomplete="username" />
            </div>
            <div class="form-error" *ngIf="submitted && f['username'].errors?.['required']">Champ obligatoire</div>
          </div>

          <div class="form-group">
            <label class="form-label">Mot de passe <span class="required">*</span></label>
            <div class="search-bar">
              <i class="bi bi-lock search-icon"></i>
              <input formControlName="password" [type]="showPwd ? 'text' : 'password'" class="form-control"
                [class.is-invalid]="submitted && f['password'].errors"
                placeholder="••••••••" autocomplete="current-password" />
              <button type="button" (click)="showPwd=!showPwd"
                style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:1.1rem;color:#64748b">
                <i class="bi" [class.bi-eye]="!showPwd" [class.bi-eye-slash]="showPwd"></i>
              </button>
            </div>
            <div class="form-error" *ngIf="submitted && f['password'].errors?.['required']">Champ obligatoire</div>
            <div style="text-align:right;margin-top:6px">
              <a routerLink="/forgot-password" style="font-size:0.8rem;color:var(--primary);text-decoration:none;font-weight:600">Mot de passe oublié ?</a>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;margin-top:8px;font-size:1rem;"
            [disabled]="loading">
             <i class="bi bi-box-arrow-in-right" *ngIf="!loading"></i>
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <div class="auth-footer">
          Pas de compte ? <a routerLink="/register" class="text-primary font-weight-bold">Créer un compte</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  error = '';
  loading = false;
  submitted = false;
  showPwd = false;

  constructor(private authService: AuthService, private router: Router) {}

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        console.error('Login error:', err);
        if (err.status === 0) {
          this.error = 'Le serveur est inaccessible. Vérifiez qu\'il est bien démarré (php artisan serve).';
        } else if (err.status === 401) {
          this.error = 'Identifiants invalides. Veuillez réessayer.';
        } else if (err.status >= 500) {
          this.error = 'Erreur interne du serveur (500). Veuillez consulter les logs du backend.';
        } else if (err.message?.includes('Http failure during parsing')) {
          this.error = 'Réponse du serveur invalide (Non-JSON). Vérifiez la configuration du backend.';
        } else {
          this.error = err.error?.message || 'Une erreur inattendue est survenue.';
        }
        this.loading = false;
      }
    });
  }
}
