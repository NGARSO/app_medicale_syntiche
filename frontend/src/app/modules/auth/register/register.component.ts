import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo"><i class="bi bi-hospital text-primary"></i></div>
        <h1 class="auth-title">Inscription Patient</h1>
        <p class="auth-subtitle">Créez votre compte pour prendre rendez-vous</p>

        <div class="alert alert-danger" *ngIf="error">
          <i class="bi bi-exclamation-triangle-fill"></i> {{ error }}
        </div>
        <div class="alert alert-success" *ngIf="success">
          <i class="bi bi-check-circle-fill"></i> {{ success }}
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Nom d'utilisateur <span class="required">*</span></label>
            <div class="search-bar">
              <i class="bi bi-person search-icon"></i>
              <input formControlName="username" type="text" class="form-control"
                [class.is-invalid]="submitted && f['username'].errors"
                placeholder="Ex: jean_dupont" />
            </div>
            <div class="form-error" *ngIf="submitted && f['username'].errors?.['required']">Obligatoire</div>
          </div>

          <div class="form-group">
            <label class="form-label">Email <span class="required">*</span></label>
            <div class="search-bar">
              <i class="bi bi-envelope search-icon"></i>
              <input formControlName="email" type="email" class="form-control"
                [class.is-invalid]="submitted && f['email'].errors"
                placeholder="exemple@clinique.com" />
            </div>
            <div class="form-error" *ngIf="submitted && f['email'].errors?.['required']">Obligatoire</div>
            <div class="form-error" *ngIf="submitted && f['email'].errors?.['email']">Email invalide</div>
          </div>

          <div class="form-group">
            <label class="form-label">Mot de passe <span class="required">*</span></label>
            <div class="search-bar">
              <i class="bi bi-lock search-icon"></i>
              <input formControlName="password" type="password" class="form-control"
                [class.is-invalid]="submitted && f['password'].errors"
                placeholder="Minimum 6 caractères" />
            </div>
            <div class="form-error" *ngIf="submitted && f['password'].errors?.['minlength']">Minimum 6 caractères</div>
          </div>

          <button type="submit" class="btn btn-primary"
            style="width:100%;justify-content:center;padding:12px;margin-top:8px;font-size:1rem;"
            [disabled]="loading">
            <i class="bi bi-person-plus-fill" *ngIf="!loading"></i>
            {{ loading ? 'Inscription...' : "S'inscrire" }}
          </button>
        </form>

        <div class="auth-footer">
          Déjà inscrit ? <a routerLink="/login">Se connecter</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  registerForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['USER']
  });

  error = '';
  success = '';
  loading = false;
  submitted = false;

  constructor(private authService: AuthService, private router: Router) {}

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.success = 'Compte créé avec succès ! Redirection...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de l\'inscription';
        this.loading = false;
      }
    });
  }
}
