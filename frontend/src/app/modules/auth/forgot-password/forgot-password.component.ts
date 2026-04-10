import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo"><i class="bi bi-shield-lock text-primary"></i></div>
        <h1 class="auth-title">Mot de passe oublié</h1>
        <p class="auth-subtitle">Saisissez votre email pour recevoir un jeton de réinitialisation</p>

        <div class="alert alert-success" *ngIf="success">
          <i class="bi bi-check-circle-fill"></i> {{ success }}
        </div>
        <div class="alert alert-danger" *ngIf="error">
          <i class="bi bi-exclamation-triangle-fill"></i> {{ error }}
        </div>

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" *ngIf="!success">
          <div class="form-group">
            <label class="form-label">Adresse e-mail</label>
            <div class="search-bar">
              <i class="bi bi-envelope search-icon"></i>
              <input formControlName="email" type="email" class="form-control" placeholder="exemple@clinique.com">
            </div>
            <div class="form-error" *ngIf="submitted && f['email'].errors?.['required']">L'email est requis</div>
            <div class="form-error" *ngIf="submitted && f['email'].errors?.['email']">Email invalide</div>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;margin-top:8px;" [disabled]="loading">
            <i class="bi bi-send-fill" *ngIf="!loading"></i>
            {{ loading ? 'Envoi...' : 'Envoyer le lien' }}
          </button>
        </form>

        <div style="margin-top:20px;text-align:center;" *ngIf="success">
          <a routerLink="/reset-password" class="btn btn-secondary w-100">Aller à la réinitialisation</a>
        </div>

        <div class="auth-footer">
          <a routerLink="/login"><i class="bi bi-arrow-left"></i> Retour à la connexion</a>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading = false;
  submitted = false;
  success = '';
  error = '';

  get f() { return this.forgotForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.forgotForm.invalid) return;

    this.loading = true;
    this.error = '';
    
    this.http.post<any>('http://localhost:8000/api/forgot-password', this.forgotForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = res.message;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Une erreur est survenue';
      }
    });
  }
}
