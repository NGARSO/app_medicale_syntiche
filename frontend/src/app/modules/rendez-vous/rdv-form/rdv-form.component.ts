import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RendezVousService } from '../../../core/services/rendez-vous.service';
import { PatientService } from '../../../core/services/patient.service';
import { MedecinService } from '../../../core/services/medecin.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Patient } from '../../../shared/models/patient.model';
import { Medecin } from '../../../shared/models/medecin.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-rdv-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="topbar">
      <div>
        <div class="topbar-title">{{ isEdit ? '✏️ Modifier le rendez-vous' : '📅 Nouveau rendez-vous' }}</div>
      </div>
      <a routerLink="/rendez-vous" class="btn btn-secondary">← Retour</a>
    </div>

    <div class="page-content">
      <div class="card" style="max-width:680px;margin:0 auto">
        <div class="card-body" [class.content-loading]="loading">
          <div class="alert alert-danger" *ngIf="error"><span>⚠️</span> {{ error }}</div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <div class="form-group">
              <label class="form-label">Patient <span class="required">*</span></label>
              <select formControlName="patient_id" class="form-control"
                [class.is-invalid]="submitted && f['patient_id'].errors">
                <option value="">-- Sélectionner un patient --</option>
                <option *ngFor="let p of patients" [value]="p.id">{{ p.nom | uppercase }} {{ p.prenom }} — {{ p.cin }}</option>
              </select>
              <div class="form-error" *ngIf="submitted && f['patient_id'].errors?.['required']">Obligatoire</div>
            </div>

            <div class="form-group">
              <label class="form-label">Médecin <span class="required">*</span></label>
              <select formControlName="medecin_id" class="form-control"
                [class.is-invalid]="submitted && f['medecin_id'].errors">
                <option value="">-- Sélectionner un médecin --</option>
                <option *ngFor="let m of medecins" [value]="m.id">Dr. {{ m.nom | uppercase }} {{ m.prenom }} — {{ m.specialite }}</option>
              </select>
              <div class="form-error" *ngIf="submitted && f['medecin_id'].errors?.['required']">Obligatoire</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date & Heure <span class="required">*</span></label>
                <input formControlName="date_heure" type="datetime-local" class="form-control"
                  [class.is-invalid]="submitted && f['date_heure'].errors" />
                <div class="form-error" *ngIf="submitted && f['date_heure'].errors?.['required']">Obligatoire</div>
              </div>
              <div class="form-group">
                <label class="form-label">Statut <span class="required">*</span></label>
                <select formControlName="statut" class="form-control">
                  <option value="EN_ATTENTE">⏳ En attente</option>
                  <option value="CONFIRME">✅ Confirmé</option>
                  <option value="ANNULE">❌ Annulé</option>
                  <option value="TERMINE">🏁 Terminé</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Motif <span class="required">*</span></label>
              <input formControlName="motif" type="text" class="form-control"
                [class.is-invalid]="submitted && f['motif'].errors"
                placeholder="Consultation, suivi, urgence..." />
              <div class="form-error" *ngIf="submitted && f['motif'].errors?.['required']">Obligatoire</div>
            </div>

            <div class="form-group">
              <label class="form-label">Notes complémentaires</label>
              <textarea formControlName="notes" class="form-control" rows="3"
                placeholder="Informations supplémentaires..."></textarea>
            </div>

            <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px">
              <a routerLink="/rendez-vous" class="btn btn-secondary">Annuler</a>
              <button type="submit" class="btn btn-primary" [disabled]="saving || loading">
                {{ saving ? 'Enregistrement...' : (isEdit ? '💾 Enregistrer' : '✅ Créer le RDV') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RdvFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rdvService = inject(RendezVousService);
  private patientService = inject(PatientService);
  private medecinService = inject(MedecinService);
  private loadingService = inject(LoadingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form = this.fb.group({
    patient_id: ['', Validators.required],
    medecin_id: ['', Validators.required],
    date_heure: ['', Validators.required],
    statut:     ['EN_ATTENTE', Validators.required],
    motif:      ['', Validators.required],
    notes:      [''],
  });

  patients: Patient[] = [];
  medecins: Medecin[] = [];
  isEdit = false;
  rdvId?: number;
  error = '';
  loading = false;
  saving = false;
  submitted = false;

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.loading = true;
    
    // Use forkJoin instead of Promise.all for better integration with LoadingService.wrap()
    const initData$ = forkJoin({
      patients: this.patientService.getAll(1, 500),
      medecins: this.medecinService.getAll(1, 500)
    });

    this.loadingService.wrap(initData$).subscribe({
      next: (res: any) => {
        this.patients = res.patients?.data || [];
        this.medecins = res.medecins?.data || [];

        this.rdvId = this.route.snapshot.params['id'];
        if (this.rdvId) {
          this.isEdit = true;
          this.loadRdvData(this.rdvId);
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Erreur lors du chargement des données initiales';
        this.loading = false;
      }
    });
  }

  private loadRdvData(id: number): void {
    this.loading = true;
    this.loadingService.wrap(this.rdvService.getById(id)).subscribe({
      next: (rdv: any) => {
        this.form.patchValue({
          ...rdv,
          patient_id: rdv.patient_id?.toString(),
          medecin_id: rdv.medecin_id?.toString(),
          date_heure: rdv.date_heure?.substring(0, 16)
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'RDV introuvable';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.saving = true;
    this.error = '';

    const payload = {
      ...this.form.value,
      patient_id: Number(this.form.value.patient_id),
      medecin_id: Number(this.form.value.medecin_id),
    };

    const obs = this.isEdit
      ? this.rdvService.update(this.rdvId!, payload)
      : this.rdvService.create(payload);

    this.loadingService.wrap(obs).subscribe({
      next: () => this.router.navigate(['/rendez-vous']),
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
