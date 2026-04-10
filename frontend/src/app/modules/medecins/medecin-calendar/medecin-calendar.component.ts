import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DisponibiliteService, Disponibilite } from '../../../core/services/disponibilite.service';
import { MedecinService } from '../../../core/services/medecin.service';
import { Medecin } from '../../../shared/models/medecin.model';

@Component({
  selector: 'app-medecin-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="page-content">
      <div class="page-header">
        <div>
          <h1 *ngIf="medecin"><i class="bi bi-calendar3"></i> Calendrier : Dr. {{ medecin.nom }}</h1>
          <p>Définissez les tranches horaires de disponibilité hebdomadaire.</p>
        </div>
        <a routerLink="/medecins" class="btn btn-secondary">
          <i class="bi bi-arrow-left"></i> Retour
        </a>
      </div>

      <div class="charts-grid">
        <!-- FORMULAIRE AJOUT -->
        <div class="card chart-card">
          <h3><i class="bi bi-plus-circle"></i> Ajouter un créneau</h3>
          <form [formGroup]="slotForm" (ngSubmit)="addSlot()" class="p-3">
            <div class="form-group">
              <label class="form-label">Jour de la semaine</label>
              <select formControlName="jour_semaine" class="form-control">
                <option *ngFor="let day of days; let i = index" [value]="i">{{ day }}</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Heure début</label>
                <input type="time" formControlName="heure_debut" class="form-control">
              </div>
              <div class="form-group">
                <label class="form-label">Heure fin</label>
                <input type="time" formControlName="heure_fin" class="form-control">
              </div>
            </div>
            <button type="submit" class="btn btn-primary w-100 mt-3" [disabled]="slotForm.invalid || loading">
              <i class="bi bi-check-lg"></i> {{ loading ? 'Ajout...' : 'Ajouter au calendrier' }}
            </button>
          </form>
        </div>

        <!-- LISTE DES CRENEAUX PAR JOUR -->
        <div class="card chart-card" style="grid-column: span 2">
          <h3><i class="bi bi-clock-history"></i> Emploi du temps hebdomadaire</h3>
          <div class="table-container p-0">
            <table>
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Créneaux horaires</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let dayIdx of [1,2,3,4,5,6,0]">
                  <td style="font-weight:600;width:150px">{{ days[dayIdx] }}</td>
                  <td>
                    <div style="display:flex;flex-wrap:wrap;gap:8px">
                      <div *ngFor="let s of getSlotsForDay(dayIdx)" 
                        class="badge badge-info" 
                        style="display:flex;align-items:center;gap:8px;padding:6px 10px;font-size:.85rem">
                        {{ s.heure_debut.substring(0,5) }} - {{ s.heure_fin.substring(0,5) }}
                        <i class="bi bi-x-circle" style="cursor:pointer" (click)="deleteSlot(s.id!)" title="Supprimer"></i>
                      </div>
                      <span *ngIf="getSlotsForDay(dayIdx).length === 0" style="color:#94a3b8;font-style:italic;font-size:.82rem">Aucun créneau</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MedecinCalendarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private dispService = inject(DisponibiliteService);
  private medService = inject(MedecinService);

  medecin?: Medecin;
  slots: Disponibilite[] = [];
  loading = false;
  days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  slotForm = this.fb.group({
    jour_semaine: [1, Validators.required],
    heure_debut: ['09:00', Validators.required],
    heure_fin: ['17:00', Validators.required],
    actif: [true]
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.medService.getById(id).subscribe(m => this.medecin = m);
    this.loadSlots(id);
  }

  loadSlots(medecinId: number) {
    this.dispService.getByMedecin(medecinId).subscribe(res => this.slots = res);
  }

  getSlotsForDay(day: number) {
    return this.slots.filter(s => s.jour_semaine == day);
  }

  addSlot() {
    if (!this.medecin || this.slotForm.invalid) return;
    this.loading = true;
    const val = { ...this.slotForm.value, medecin_id: this.medecin.id } as Disponibilite;
    this.dispService.create(val).subscribe({
      next: () => {
        this.loadSlots(this.medecin!.id!);
        this.loading = false;
        this.slotForm.patchValue({ heure_debut: '09:00', heure_fin: '17:00' });
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message || 'Erreur lors de l\'ajout du créneau');
      }
    });
  }

  deleteSlot(id: number) {
    if (!confirm('Supprimer ce créneau ?')) return;
    this.dispService.delete(id).subscribe(() => {
      this.loadSlots(this.medecin!.id!);
    });
  }
}
