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
        <div class="topbar-title">{{ isEdit ? '✏️ Modifier le patient' : '➕ Nouveau patient' }}</div>
        <div class="topbar-date">{{ isEdit ? 'Modification des informations' : 'Enregistrement d\'un nouveau patient' }}</div>
      </div>
      <a routerLink="/patients" class="btn btn-secondary">← Retour</a>
    </div>

    <div class="page-content">
      <div class="card" style="max-width:760px;margin:0 auto">
        <div class="card-body" [class.content-loading]="loading">

          <div class="alert alert-danger" *ngIf="error"><span>⚠️</span> {{ error }}</div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nom <span class="required">*</span></label>
                <input formControlName="nom" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['nom'].errors" placeholder="Nom de famille" />
                <div class="form-error" *ngIf="submitted && f['nom'].errors?.['required']">Obligatoire</div>
              </div>
              <div class="form-group">
                <label class="form-label">Prénom <span class="required">*</span></label>
                <input formControlName="prenom" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['prenom'].errors" placeholder="Prénom" />
                <div class="form-error" *ngIf="submitted && f['prenom'].errors?.['required']">Obligatoire</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">CIN <span class="required">*</span></label>
                <input formControlName="cin" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['cin'].errors" placeholder="Ex: SN12345678" />
                <div class="form-error" *ngIf="submitted && f['cin'].errors?.['required']">Obligatoire</div>
              </div>
              <div class="form-group">
                <label class="form-label">Date de naissance <span class="required">*</span></label>
                <input formControlName="date_naissance" type="date" class="form-control"
                  [class.is-invalid]="submitted && f['date_naissance'].errors" />
                <div class="form-error" *ngIf="submitted && f['date_naissance'].errors?.['required']">Obligatoire</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input formControlName="email" type="email" class="form-control" placeholder="patient@email.com" />
              </div>
              <div class="form-group">
                <label class="form-label">Téléphone <span class="required">*</span></label>
                <input formControlName="telephone" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['telephone'].errors" placeholder="07 00 00 00 00" />
                <div class="form-error" *ngIf="submitted && f['telephone'].errors?.['required']">Obligatoire</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Sexe <span class="required">*</span></label>
                <select formControlName="sexe" class="form-control">
                  <option value="">-- Choisir --</option>
                  <option value="M">♂ Masculin</option>
                  <option value="F">♀ Féminin</option>
                </select>
                <div class="form-error" *ngIf="submitted && f['sexe'].errors?.['required']">Obligatoire</div>
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
              <textarea formControlName="antecedents" class="form-control" rows="3"
                placeholder="Allergies, maladies chroniques, chirurgies passées..."></textarea>
            </div>

            <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px">
              <a routerLink="/patients" class="btn btn-secondary">Annuler</a>
              <button type="submit" class="btn btn-primary" [disabled]="saving || loading">
                {{ saving ? 'Enregistrement...' : (isEdit ? '💾 Enregistrer' : '✅ Créer le patient') }}
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
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
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
