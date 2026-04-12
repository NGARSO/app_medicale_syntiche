import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MedecinService } from '../../../core/services/medecin.service';
import { LoadingService } from '../../../core/services/loading.service';

const SPECIALITES = [
  'Cardiologie','Chirurgie','Dermatologie','Endocrinologie','Gastro-entérologie',
  'Gynécologie','Hématologie','Médecine générale','Neurologie','Obstétrique',
  'Oncologie','Ophtalmologie','Orthopédie','ORL','Pédiatrie','Pneumologie',
  'Psychiatrie','Radiologie','Rhumatologie','Urologie'
];

@Component({
  selector: 'app-medecin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="topbar">
      <div>
        <div class="topbar-title">
          <i class="bi" [class.bi-pencil-square]="isEdit" [class.bi-person-plus-fill]="!isEdit"></i>
          {{ isEdit ? ' Modifier le médecin' : ' Nouveau médecin' }}
        </div>
      </div>
      <a routerLink="/medecins" class="btn btn-secondary"><i class="bi bi-arrow-left"></i> Retour</a>
    </div>

    <div class="page-content">
      <div class="card" style="max-width:760px;margin:0 auto">
        <div class="card-body" [class.content-loading]="loading">
          <div class="alert alert-danger" *ngIf="error"><i class="bi bi-exclamation-triangle-fill"></i> {{ error }}</div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            
            <!-- Section : Profil Médical -->
            <div class="form-section-header">
              <i class="bi bi-person-badge-fill me-2"></i> Informations Professionnelles
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nom <span class="required">*</span></label>
                <input formControlName="nom" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['nom'].errors" placeholder="Nom" />
                <div class="form-error" *ngIf="submitted && f['nom'].errors?.['required']">Le nom est obligatoire</div>
              </div>
              <div class="form-group">
                <label class="form-label">Prénom <span class="required">*</span></label>
                <input formControlName="prenom" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['prenom'].errors" placeholder="Prénom" />
                <div class="form-error" *ngIf="submitted && f['prenom'].errors?.['required']">Le prénom est obligatoire</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Spécialité <span class="required">*</span></label>
              <select formControlName="specialite" class="form-control" [class.is-invalid]="submitted && f['specialite'].errors">
                <option value="">-- Choisir une spécialité --</option>
                <option *ngFor="let s of specialites" [value]="s">{{ s }}</option>
              </select>
              <div class="form-error" *ngIf="submitted && f['specialite'].errors?.['required']">Veuillez choisir une spécialité</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email Professionnel <span class="required">*</span></label>
                <input formControlName="email" type="email" class="form-control"
                  [class.is-invalid]="submitted && f['email'].errors" placeholder="dr.exemple@clinique.com" />
                <div class="form-error" *ngIf="submitted && f['email'].errors?.['required']">L'email est obligatoire</div>
                <div class="form-error" *ngIf="submitted && f['email'].errors?.['email']">Format d'email invalide</div>
              </div>
              <div class="form-group">
                <label class="form-label">Téléphone <span class="required">*</span></label>
                <input formControlName="telephone" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['telephone'].errors" placeholder="07 00 00 00 00" />
                <div class="form-error" *ngIf="submitted && f['telephone'].errors?.['required']">Le téléphone est obligatoire</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Matricule / RPPS <span class="required">*</span></label>
                <input formControlName="matricule" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['matricule'].errors" placeholder="MED001" />
                <div class="form-error" *ngIf="submitted && f['matricule'].errors?.['required']">Le matricule est obligatoire</div>
              </div>
              <div class="form-group">
                <label class="form-label">Statut</label>
                <select formControlName="disponible" class="form-control">
                  <option [value]="true">En activité (Disponible)</option>
                  <option [value]="false">Indisponible (Archive)</option>
                </select>
              </div>
            </div>

            <!-- Section : Compte Utilisateur (Seulement en création) -->
            <ng-container *ngIf="!isEdit">
              <div class="form-section-header mt-4">
                <i class="bi bi-shield-lock-fill me-2"></i> Compte Médecin (Accès Professionnel)
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Identifiant <span class="required">*</span></label>
                  <div class="input-with-icon">
                    <i class="bi bi-at"></i>
                    <input formControlName="username" type="text" class="form-control ps-5" 
                      [class.is-invalid]="submitted && f['username'].errors" placeholder="dr.nom" />
                  </div>
                  <div class="form-error" *ngIf="submitted && f['username'].errors?.['required']">L'identifiant est obligatoire</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Mot de passe <span class="required">*</span></label>
                  <div class="input-with-icon">
                    <i class="bi bi-key"></i>
                    <input formControlName="password" type="password" class="form-control ps-5" 
                      [class.is-invalid]="submitted && f['password'].errors" placeholder="••••••" />
                  </div>
                  <div class="form-error" *ngIf="submitted && f['password'].errors?.['required']">Le mot de passe est obligatoire</div>
                  <div class="form-error" *ngIf="submitted && f['password'].errors?.['minlength']">Minimum 6 caractères</div>
                </div>
              </div>
            </ng-container>

            <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px">
              <a routerLink="/medecins" class="btn btn-secondary">Annuler</a>
              <button type="submit" class="btn btn-primary" [disabled]="saving || loading">
                <i class="bi" [class.bi-save]="isEdit" [class.bi-check-circle]="!isEdit"></i>
                {{ saving ? 'Enregistrement...' : (isEdit ? ' Enregistrer les changements' : ' Créer Médecin & Compte') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class MedecinFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private medecinService = inject(MedecinService);
  private loadingService = inject(LoadingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form = this.fb.group({
    nom:        ['', Validators.required],
    prenom:     ['', Validators.required],
    specialite: ['', Validators.required],
    email:      ['', [Validators.required, Validators.email]],
    telephone:  ['', Validators.required],
    matricule:  ['', Validators.required],
    disponible: [true],
    // User fields
    username:   [''],
    password:   ['']
  });

  specialites = SPECIALITES;
  isEdit = false;
  medecinId?: number;
  error = '';
  loading = false;
  saving = false;
  submitted = false;

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.medecinId = this.route.snapshot.params['id'];
    if (this.medecinId) {
      this.isEdit = true;
      this.loading = true;
      this.loadingService.wrap(this.medecinService.getById(this.medecinId)).subscribe({
        next: (m) => { this.form.patchValue(m as any); this.loading = false; },
        error: () => { this.error = 'Médecin introuvable'; this.loading = false; }
      });
    } else {
      // Add required validators for creation
      this.form.get('username')?.setValidators([Validators.required]);
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.error = 'Veuillez remplir correctement tous les champs obligatoires (marqués par *).';
      return;
    }
    this.saving = true;
    this.error = '';

    const obs = this.isEdit
      ? this.medecinService.update(this.medecinId!, this.form.value as any)
      : this.medecinService.create(this.form.value as any);

    this.loadingService.wrap(obs).subscribe({
      next: () => this.router.navigate(['/medecins']),
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de l\'enregistrement';
        if (err.error?.errors) {
          const msgs = Object.values(err.error.errors).flat() as string[];
          this.error = msgs.join(' | ');
        }
        this.saving = false;
      }
    });
  }
}
