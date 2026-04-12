import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-content">
      <div class="page-header">
        <div>
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles et votre photo de profil</p>
        </div>
      </div>

      <div class="charts-grid">
        <!-- PHOTO & INFO -->
        <div class="card chart-card">
          <h3>Photo de Profil</h3>
          <div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:20px;">
            <div style="width:150px;height:150px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;overflow:hidden;border:4px solid var(--primary-light)">
              <img *ngIf="photoUrl" [src]="photoUrl" style="width:100%;height:100%;object-fit:cover;">
              <i *ngIf="!photoUrl" class="bi bi-person-fill" style="font-size:5rem;color:#94a3b8"></i>
            </div>
            
            <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display:none">
            <button class="btn btn-secondary" (click)="fileInput.click()" [disabled]="uploading">
              <i class="bi bi-camera-fill"></i>
              {{ uploading ? 'Chargement...' : 'Changer la photo' }}
            </button>
            <p style="font-size:0.75rem;color:var(--text-muted)">JPG, PNG ou JPEG. Max 2Mo.</p>
          </div>
        </div>

        <!-- FORMULAIRE -->
        <div class="card chart-card" style="grid-column: span 2">
          <h3>Informations Générales</h3>
          <div class="alert alert-success" *ngIf="success">{{ success }}</div>
          <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nom d'utilisateur</label>
                <div class="search-bar">
                  <i class="bi bi-person search-icon"></i>
                  <input formControlName="username" type="text" class="form-control">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <div class="search-bar">
                  <i class="bi bi-envelope search-icon"></i>
                  <input formControlName="email" type="email" class="form-control">
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
              <div class="search-bar">
                <i class="bi bi-lock search-icon"></i>
                <input formControlName="password" type="password" class="form-control" placeholder="••••••••">
              </div>
            </div>

            <div style="margin-top:20px;display:flex;justify-content:flex-end">
              <button type="submit" class="btn btn-primary" [disabled]="loading">
                <i class="bi bi-save"></i>
                {{ loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .p-20 { padding: 20px; }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  profileForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['']
  });

  photoUrl: string | null = null;
  loading = false;
  uploading = false;
  success = '';
  error = '';

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const user = this.authService.getUser();
    if (user) {
      this.profileForm.patchValue({
        username: user.username,
        email: user.email
      });
      if (user.photo_url) {
        this.photoUrl = user.photo_url;
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Fichier sélectionné:', file.name, 'Size:', file.size);
      
      if (file.size > 2 * 1024 * 1024) {
        this.error = 'L\'image est trop volumineuse (max 2Mo)';
        return;
      }

      this.uploading = true;
      this.error = '';
      
      const formData = new FormData();
      formData.append('photo', file);

      console.log('Début du téléchargement vers /api/profile/photo...');
      
      this.http.post<any>('/api/profile/photo', formData).subscribe({
        next: (res) => {
          console.log('Téléchargement réussi:', res);
          // Utilise une URL relative pour passer par le proxy
          const relativeUrl = res.url.includes('/storage/') ? '/storage/' + res.url.split('/storage/')[1] : res.url;
          
          this.photoUrl = relativeUrl;
          this.uploading = false;
          
          // Mise à jour complète du localStorage pour persistance
          const user = this.authService.getUser();
          if (user) {
            user.photo_profil = relativeUrl.split('/storage/')[1];
            user.photo_url = relativeUrl; 
            localStorage.setItem('user', JSON.stringify(user));
            console.log('LocalStorage mis à jour avec URL relative:', relativeUrl);
          }
        },
        error: (err) => {
          console.error('Erreur lors du téléchargement:', err);
          this.uploading = false;
          this.error = err.error?.message || 'Erreur lors du téléchargement de la photo';
        }
      });
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.loading = true;
    this.success = '';
    this.error = '';

    this.http.put<any>('/api/profile', this.profileForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = 'Profil mis à jour avec succès';
        localStorage.setItem('user', JSON.stringify(res.user));
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de la mise à jour';
      }
    });
  }
}
