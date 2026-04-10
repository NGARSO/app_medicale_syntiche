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
      <div class="card" style="max-width:700px;margin:0 auto">
        <div class="card-body" [class.content-loading]="loading">
          <div class="alert alert-danger" *ngIf="error"><i class="bi bi-exclamation-triangle-fill"></i> {{ error }}</div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nom <span class="required">*</span></label>
                <input formControlName="nom" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['nom'].errors" placeholder="Nom" />
                <div class="form-error" *ngIf="submitted && f['nom'].errors?.['required']">Obligatoire</div>
              </div>
              <div class="form-group">
                <label class="form-label">Prénom <span class="required">*</span></label>
                <input formControlName="prenom" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['prenom'].errors" placeholder="Prénom" />
                <div class="form-error" *ngIf="submitted && f['prenom'].errors?.['required']">Obligatoire</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Spécialité <span class="required">*</span></label>
              <select formControlName="specialite" class="form-control">
                <option value="">-- Choisir une spécialité --</option>
                <option *ngFor="let s of specialites" [value]="s">{{ s }}</option>
              </select>
              <div class="form-error" *ngIf="submitted && f['specialite'].errors?.['required']">Obligatoire</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email <span class="required">*</span></label>
                <input formControlName="email" type="email" class="form-control"
                  [class.is-invalid]="submitted && f['email'].errors" placeholder="dr.exemple@clinique.com" />
                <div class="form-error" *ngIf="submitted && f['email'].errors?.['required']">Obligatoire</div>
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
                <label class="form-label">Matricule <span class="required">*</span></label>
                <input formControlName="matricule" type="text" class="form-control"
                  [class.is-invalid]="submitted && f['matricule'].errors" placeholder="MED001" />
                <div class="form-error" *ngIf="submitted && f['matricule'].errors?.['required']">Obligatoire</div>
              </div>
              <div class="form-group">
                <label class="form-label">Disponibilité</label>
                <select formControlName="disponible" class="form-control">
                  <option [value]="true">Disponible</option>
                  <option [value]="false">Indisponible</option>
                </select>
              </div>
            </div>

            <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px">
              <a routerLink="/medecins" class="btn btn-secondary">Annuler</a>
              <button type="submit" class="btn btn-primary" [disabled]="saving || loading">
                <i class="bi" [class.bi-save]="isEdit" [class.bi-check-circle]="!isEdit"></i>
                {{ saving ? 'Enregistrement...' : (isEdit ? ' Enregistrer' : ' Créer le médecin') }}
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
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
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
