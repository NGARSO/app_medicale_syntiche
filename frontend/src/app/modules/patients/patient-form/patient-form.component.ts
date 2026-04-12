import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="topbar">
      <div>
        <div class="topbar-title">
          <i class="bi" [class.bi-pencil-square]="isEdit" [class.bi-person-plus-fill]="!isEdit"></i>
          {{ isEdit ? ' Modifier le patient' : ' Nouveau patient' }}
        </div>
      </div>
      <a routerLink="/patients" class="btn btn-secondary">← Retour</a>
    </div>

    <div class="page-content">
      <div class="card" style="max-width:800px;margin:0 auto">
        <div class="card-body" [class.content-loading]="loading">
          <div class="alert alert-danger" *ngIf="error"><span>⚠️</span> {{ error }}</div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            
            <!-- Section : État Civil -->
            <div class="form-section-header">
              <i class="bi bi-person-lines-fill me-2"></i> État Civil & Contact
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nom <span class="required">*</span></label>
                <input formControlName="nom" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['nom'].errors" placeholder="Nom de famille" />
                <div class="form-error" *ngIf="submitted && f['nom'].errors?.['required']">Le nom est obligatoire</div>
              </div>
              <div class="form-group">
                <label class="form-label">Prénom <span class="required">*</span></label>
                <input formControlName="prenom" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['prenom'].errors" placeholder="Prénom" />
                <div class="form-error" *ngIf="submitted && f['prenom'].errors?.['required']">Le prénom est obligatoire</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">CIN <span class="required">*</span></label>
                <input formControlName="cin" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['cin'].errors" placeholder="Ex: SN12345678" />
                <div class="form-error" *ngIf="submitted && f['cin'].errors?.['required']">Le CIN est obligatoire</div>
              </div>
              <div class="form-group">
                <label class="form-label">Date de naissance <span class="required">*</span></label>
                <input formControlName="date_naissance" type="date" class="form-control"
                  [class.is-invalid]="submitted && f['date_naissance'].errors" />
                <div class="form-error" *ngIf="submitted && f['date_naissance'].errors?.['required']">La date de naissance est obligatoire</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input formControlName="email" type="email" class="form-control" 
                  [class.is-invalid]="submitted && f['email'].errors" placeholder="patient@email.com" />
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
                <label class="form-label">Sexe <span class="required">*</span></label>
                <select formControlName="sexe" class="form-control" [class.is-invalid]="submitted && f['sexe'].errors">
                  <option value="">-- Choisir --</option>
                  <option value="M">♂ Masculin</option>
                  <option value="F">♀ Féminin</option>
                </select>
                <div class="form-error" *ngIf="submitted && f['sexe'].errors?.['required']">Le sexe est obligatoire</div>
              </div>
              <div class="form-group">
                <label class="form-label">Groupe sanguin</label>
                <select formControlName="groupe_sanguin" class="form-control">
                  <option value="">-- Inconnu --</option>
                  <option *ngFor="let gs of groupesSanguins" [value]="gs">{{ gs }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Antécédents médicaux</label>
              <textarea formControlName="antecedents" class="form-control" rows="2"
                placeholder="Allergies, maladies chroniques..."></textarea>
            </div>

            <!-- Section : Compte Utilisateur (Seulement en création) -->
            <ng-container *ngIf="!isEdit">
              <div class="form-section-header mt-4">
                <i class="bi bi-shield-lock-fill me-2"></i> Compte Patient (Accès à l'application)
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nom d'utilisateur <span class="required">*</span></label>
                  <div class="input-with-icon">
                    <i class="bi bi-at"></i>
                    <input formControlName="username" type="text" class="form-control ps-5" 
                      [class.is-invalid]="submitted && f['username'].errors" placeholder="identifiant" />
                  </div>
                  <div class="form-error" *ngIf="submitted && f['username'].errors?.['required']">L'identifiant est obligatoire</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Mot de passe provisoire <span class="required">*</span></label>
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
              <a routerLink="/patients" class="btn btn-secondary">Annuler</a>
              <button type="submit" class="btn btn-primary" [disabled]="saving || loading">
                <i class="bi bi-check-circle me-1"></i>
                {{ saving ? 'Enregistrement...' : (isEdit ? 'Enregistrer les modifications' : 'Créer Patient & Compte') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class PatientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private patientService = inject(PatientService);
  private loadingService = inject(LoadingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form = this.fb.group({
    nom:            ['', Validators.required],
    prenom:         ['', Validators.required],
    date_naissance: ['', Validators.required],
    cin:            ['', Validators.required],
    email:          [''],
    telephone:      ['', Validators.required],
    sexe:           ['', Validators.required],
    groupe_sanguin: [''],
    antecedents:    [''],
    // User fields
    username:       [''],
    password:       ['']
  });

  groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  isEdit = false;
  patientId?: number;
  error = '';
  loading = false;
  saving = false;
  submitted = false;

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params['id'];
    if (this.patientId) {
      this.isEdit = true;
      this.loading = true;
      this.loadingService.wrap(this.patientService.getById(this.patientId)).subscribe({
        next: (p) => {
          this.form.patchValue({ ...p, date_naissance: p.date_naissance?.substring(0, 10) });
          this.loading = false;
        },
        error: () => { this.error = 'Patient introuvable'; this.loading = false; }
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
      ? this.patientService.update(this.patientId!, this.form.value as any)
      : this.patientService.create(this.form.value as any);

    this.loadingService.wrap(obs).subscribe({
      next: () => this.router.navigate(['/patients']),
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
