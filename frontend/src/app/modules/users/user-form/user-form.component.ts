import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-content">
      <div class="page-header">
        <div>
          <h1>{{ isEdit ? 'Modifier' : 'Nouvel' }} Utilisateur</h1>
          <p>{{ isEdit ? 'Éditez les informations du compte' : 'Créez un nouveau compte utilisateur' }}</p>
        </div>
      </div>

      <div class="card" style="max-width:600px">
        <div class="card-body">
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">Nom d'utilisateur</label>
              <div class="search-bar">
                <i class="bi bi-person search-icon"></i>
                <input formControlName="username" type="text" class="form-control" placeholder="nomutilisateur">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email</label>
              <div class="search-bar">
                <i class="bi bi-envelope search-icon"></i>
                <input formControlName="email" type="email" class="form-control" placeholder="email@exemple.com">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Rôle</label>
              <div class="search-bar">
                <i class="bi bi-shield-check search-icon"></i>
                <select formControlName="role" class="form-control">
                  <option value="USER">Patient</option>
                  <option value="MEDECIN">Médecin</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Mot de passe {{ isEdit ? '(laisser vide pour inchangé)' : '' }}</label>
              <div class="search-bar">
                <i class="bi bi-lock search-icon"></i>
                <input formControlName="password" type="password" class="form-control" placeholder="••••••••">
              </div>
            </div>

            <div style="margin-top:24px;display:flex;gap:12px;justify-content:flex-end">
              <a routerLink="/users" class="btn btn-secondary">Annuler</a>
              <button type="submit" class="btn btn-primary" [disabled]="loading || userForm.invalid">
                <i class="bi bi-check-lg"></i>
                {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  userForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['USER', Validators.required],
    password: ['']
  });

  isEdit = false;
  loading = false;
  userId?: number;

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.userId) {
      this.isEdit = true;
      this.loadUser();
    } else {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  loadUser() {
    this.userService.getById(this.userId!).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          role: user.role
        });
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.loading = true;
    const data = this.userForm.value as User;

    const obs = this.isEdit 
      ? this.userService.update(this.userId!, data)
      : this.userService.create(data);

    obs.subscribe({
      next: () => {
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message || 'Une erreur est survenue');
      }
    });
  }
}
