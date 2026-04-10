import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo"><i class="bi bi-key-fill text-primary"></i></div>
        <h1 class="auth-title">Nouveau mot de passe</h1>
        <p class="auth-subtitle">Saisissez le jeton reçu par email et votre nouveau mot de passe</p>

        <div class="alert alert-success" *ngIf="success">
          <i class="bi bi-check-circle-fill"></i> {{ success }}
        </div>
        <div class="alert alert-danger" *ngIf="error">
          <i class="bi bi-exclamation-triangle-fill"></i> {{ error }}
        </div>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" *ngIf="!success">
          <div class="form-group">
            <label class="form-label">Adresse e-mail</label>
            <div class="search-bar">
              <i class="bi bi-envelope search-icon"></i>
              <input formControlName="email" type="email" class="form-control" placeholder="exemple@clinique.com">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Jeton (Token)</label>
            <div class="search-bar">
              <i class="bi bi-hash search-icon"></i>
              <input formControlName="token" type="text" class="form-control" placeholder="Copiez le code ici">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Nouveau mot de passe</label>
            <div class="search-bar">
              <i class="bi bi-lock search-icon"></i>
              <input formControlName="password" type="password" class="form-control" placeholder="Minimum 6 caractères">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Confirmer le mot de passe</label>
            <div class="search-bar">
              <i class="bi bi-lock-fill search-icon"></i>
              <input formControlName="password_confirmation" type="password" class="form-control" placeholder="••••••••">
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;margin-top:8px;" [disabled]="loading">
            <i class="bi bi-check-lg" *ngIf="!loading"></i>
            {{ loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}
          </button>
        </form>

        <div class="auth-footer">
          <a routerLink="/login"><i class="bi bi-arrow-left"></i> Retour à la connexion</a>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    token: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', Validators.required]
  });

  loading = false;
  submitted = false;
  success = '';
  error = '';

  onSubmit() {
    this.submitted = true;
    if (this.resetForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.http.post<any>('http://localhost:8000/api/reset-password', this.resetForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = res.message;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Une erreur est survenue. Vérifiez vos informations.';
      }
    });
  }
}
