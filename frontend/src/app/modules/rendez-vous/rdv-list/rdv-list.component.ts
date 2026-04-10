import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RendezVousService } from '../../../core/services/rendez-vous.service';
import { LoadingService } from '../../../core/services/loading.service';
import { RendezVous, StatutRdv } from '../../../shared/models/rendez-vous.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-rdv-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="topbar">
      <div>
        <div class="topbar-title"><i class="bi bi-calendar-event-fill"></i> Rendez-vous</div>
        <div class="topbar-date">{{ totalElements }} rendez-vous enregistré(s)</div>
      </div>
      <div style="display:flex;gap:10px">
        <button (click)="exportToExcel()" class="btn btn-secondary">
          <i class="bi bi-file-earmark-excel"></i> Exporter
        </button>
        <a routerLink="/rendez-vous/new" class="btn btn-primary">
          <i class="bi bi-calendar-plus"></i> Nouveau RDV
        </a>
      </div>
    </div>

    <div class="page-content">
      <!-- Filtres -->
      <div class="toolbar">
        <div>
          <label style="font-size:.8rem;font-weight:600;color:#64748b;margin-right:8px">Statut :</label>
          <div style="display:inline-flex;gap:6px">
            <button *ngFor="let f of statutFilters" class="btn btn-sm"
              [class.btn-primary]="selectedStatut === f.value"
              [class.btn-secondary]="selectedStatut !== f.value"
              (click)="filterByStatut(f.value)">
              <i class="bi" [class]="f.icon"></i> {{ f.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="table-container" [class.content-loading]="loading">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Date & Heure</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rdv of rdvList; let i = index">
                <td style="color:#64748b;font-size:.8rem">{{ i + 1 }}</td>
                <td>
                  <div style="font-weight:600">{{ rdv.patient?.nom | uppercase }} {{ rdv.patient?.prenom }}</div>
                  <div style="font-size:.75rem;color:#64748b">{{ rdv.patient?.cin }}</div>
                </td>
                <td>
                  <div style="font-weight:600">Dr. {{ rdv.medecin?.nom }}</div>
                  <div style="font-size:.75rem;color:#64748b">{{ rdv.medecin?.specialite }}</div>
                </td>
                <td>
                  <div style="font-weight:600">{{ rdv.date_heure | date:'dd/MM/yyyy' }}</div>
                  <div style="font-size:.75rem;color:#64748b">{{ rdv.date_heure | date:'HH:mm' }}</div>
                </td>
                <td style="max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" [title]="rdv.motif">{{ rdv.motif }}</td>
                <td><span class="badge badge-dot" [class]="getStatutClass(rdv.statut)">{{ getStatutLabel(rdv.statut) }}</span></td>
                <td>
                  <div style="display:flex;gap:6px">
                    <a *ngIf="userRole === 'MEDECIN' || userRole === 'ADMIN'" 
                       [routerLink]="['/consultations/new']" 
                       [queryParams]="{ rdvId: rdv.id, patientId: rdv.patient_id, medecinId: rdv.medecin_id }"
                       class="btn btn-sm btn-info" title="Démarrer la consultation">
                      <i class="bi bi-stethoscope"></i>
                    </a>
                    <a [routerLink]="['/rendez-vous', rdv.id, 'edit']" class="btn btn-sm btn-warning" title="Modifier">
                      <i class="bi bi-pencil"></i>
                    </a>
                    <button class="btn btn-sm btn-danger" (click)="deleteRdv(rdv.id!)" title="Supprimer">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="rdvList.length === 0 && !loading">
                <td colspan="7">
                  <div class="empty-state">
                    <div class="icon"><i class="bi bi-calendar-x"></i></div>
                    <p>Aucun rendez-vous trouvé</p>
                    <small>Créez votre premier rendez-vous</small>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer" *ngIf="totalPages > 1">
          <div class="pagination">
            <button class="page-btn" (click)="onPageChange(currentPage - 1)" [disabled]="currentPage === 0"><i class="bi bi-chevron-left"></i></button>
            <button *ngFor="let p of pageRange" class="page-btn" [class.active]="p === currentPage" (click)="onPageChange(p)">{{ p + 1 }}</button>
            <button class="page-btn" (click)="onPageChange(currentPage + 1)" [disabled]="currentPage >= totalPages - 1"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RdvListComponent implements OnInit {
  private rdvService = inject(RendezVousService);
  private loadingService = inject(LoadingService);
  private authService = inject(AuthService);

  rdvList: RendezVous[] = [];
  userRole = '';
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;
  loading = false;
  selectedStatut = '';

  statutFilters = [
    { value: '', label: 'Tous', icon: 'bi-grid-fill' },
    { value: 'EN_ATTENTE', label: 'En attente', icon: 'bi-hourglass-split' },
    { value: 'CONFIRME', label: 'Confirmés', icon: 'bi-check-circle-fill' },
    { value: 'ANNULE', label: 'Annulés', icon: 'bi-x-circle-fill' },
    { value: 'TERMINE', label: 'Terminés', icon: 'bi-flag-fill' },
  ];

  get pageRange(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  ngOnInit(): void { 
    this.userRole = this.authService.getRole();
    this.loadRdv(); 
  }

  loadRdv(): void {
    this.loading = true;
    const filters = this.selectedStatut ? { statut: this.selectedStatut } : {};
    this.loadingService.wrap(this.rdvService.getAll(filters, this.currentPage + 1, this.pageSize)).subscribe({
      next: (data: any) => {
        this.rdvList = data.data || [];
        this.totalElements = data.total || 0;
        this.totalPages = data.last_page || 0;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filterByStatut(statut: string): void {
    this.selectedStatut = statut;
    this.currentPage = 0;
    this.loadRdv();
  }

  onPageChange(page: number): void { this.currentPage = page; this.loadRdv(); }

  deleteRdv(id: number): void {
    if (!confirm('Supprimer ce rendez-vous ?')) return;
    this.rdvService.delete(id).subscribe(() => this.loadRdv());
  }

  exportToExcel(): void {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:8000/api/export/rendez-vous?token=${token}`, '_blank');
  }

  getStatutClass(statut: StatutRdv): string {
    const map: any = { EN_ATTENTE: 'badge-warning', CONFIRME: 'badge-success', ANNULE: 'badge-danger', TERMINE: 'badge-secondary' };
    return map[statut] || 'badge-secondary';
  }

  getStatutLabel(statut: StatutRdv): string {
    const map: any = { EN_ATTENTE: 'En attente', CONFIRME: 'Confirmé', ANNULE: 'Annulé', TERMINE: 'Terminé' };
    return map[statut] || statut;
  }
}
