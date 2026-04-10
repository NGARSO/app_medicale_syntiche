import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PatientService } from '../../../core/services/patient.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Patient } from '../../../shared/models/patient.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="topbar">
      <div>
        <div class="topbar-title"><i class="bi bi-people-fill"></i> Patients</div>
        <div class="topbar-date">{{ totalElements }} patient(s) enregistré(s)</div>
      </div>
      <div style="display:flex;gap:10px">
        <button (click)="exportToExcel()" class="btn btn-secondary">
          <i class="bi bi-file-earmark-excel"></i> Exporter
        </button>
        <a routerLink="/patients/new" class="btn btn-primary">
          <i class="bi bi-person-plus"></i> Nouveau patient
        </a>
      </div>
    </div>

    <div class="page-content">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-bar" style="flex:1;max-width:380px">
          <i class="bi bi-search search-icon"></i>
          <input [formControl]="searchControl" type="text" class="form-control"
            placeholder="Rechercher par nom, prénom, CIN, email..." />
        </div>
        <div class="toolbar-right">
          <span style="font-size:.82rem;color:#64748b;align-self:center">
            Page {{ currentPage + 1 }} / {{ totalPages || 1 }}
          </span>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-container" [class.content-loading]="loading">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nom & Prénom</th>
                <th>CIN</th>
                <th>Téléphone</th>
                <th>Sexe</th>
                <th>Groupe sanguin</th>
                <th>Date naissance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of patients; let i = index">
                <td style="color:#64748b;font-size:.8rem">{{ i + 1 + currentPage * pageSize }}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#1e40af,#3b82f6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.85rem;flex-shrink:0">
                      {{ p.nom.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div style="font-weight:600">{{ p.nom | uppercase }} {{ p.prenom }}</div>
                      <div style="font-size:.75rem;color:#64748b">{{ p.email || '—' }}</div>
                    </div>
                  </div>
                </td>
                <td><span style="font-family:monospace;font-size:.82rem">{{ p.cin }}</span></td>
                <td>{{ p.telephone }}</td>
                <td>
                  <span class="badge" [class]="p.sexe === 'M' ? 'badge-info' : 'badge-warning'">
                    <i class="bi" [class.bi-gender-male]="p.sexe === 'M'" [class.bi-gender-female]="p.sexe === 'F'"></i>
                    {{ p.sexe === 'M' ? 'Homme' : 'Femme' }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-danger" *ngIf="p.groupe_sanguin"><i class="bi bi-droplet-fill"></i> {{ p.groupe_sanguin }}</span>
                  <span *ngIf="!p.groupe_sanguin" style="color:#64748b">—</span>
                </td>
                <td style="font-size:.82rem">{{ p.date_naissance | date:'dd/MM/yyyy' }}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    <a [routerLink]="['/patients', p.id, 'edit']" class="btn btn-sm btn-warning" title="Modifier">
                      <i class="bi bi-pencil"></i>
                    </a>
                    <button class="btn btn-sm btn-danger" (click)="deletePatient(p.id!)" title="Supprimer">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="patients.length === 0 && !loading">
                <td colspan="8">
                  <div class="empty-state">
                    <div class="icon"><i class="bi bi-people"></i></div>
                    <p>Aucun patient trouvé</p>
                    <small>Ajoutez votre premier patient avec le bouton ci-dessus</small>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="card-footer" *ngIf="totalPages > 1">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:.82rem;color:#64748b">
              Affichage {{ (currentPage * pageSize) + 1 }}–{{ Math.min((currentPage + 1) * pageSize, totalElements) }} sur {{ totalElements }}
            </span>
            <div class="pagination">
              <button class="page-btn" (click)="onPageChange(currentPage - 1)" [disabled]="currentPage === 0"><i class="bi bi-chevron-left"></i></button>
              <button *ngFor="let p of pageRange" class="page-btn" [class.active]="p === currentPage"
                (click)="onPageChange(p)">{{ p + 1 }}</button>
              <button class="page-btn" (click)="onPageChange(currentPage + 1)" [disabled]="currentPage >= totalPages - 1"><i class="bi bi-chevron-right"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PatientListComponent implements OnInit {
  private patientService = inject(PatientService);
  private loadingService = inject(LoadingService);
  patients: Patient[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;
  loading = false;
  searchControl = new FormControl('');
  searchKeyword = '';
  Math = Math;

  get pageRange(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  ngOnInit(): void {
    this.loadPatients();
    this.searchControl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(kw => {
      this.searchKeyword = kw || '';
      this.currentPage = 0;
      this.loadPatients();
    });
  }

  loadPatients(): void {
    this.loading = true;
    const obs = this.searchKeyword
      ? this.patientService.search(this.searchKeyword, this.currentPage + 1, this.pageSize)
      : this.patientService.getAll(this.currentPage + 1, this.pageSize);

    this.loadingService.wrap(obs).subscribe({
      next: (data: any) => {
        this.patients = data.data || [];
        this.totalElements = data.total || 0;
        this.totalPages = data.last_page || 0;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPatients();
  }

  deletePatient(id: number): void {
    if (!confirm('Supprimer ce patient ? Cette action est irréversible.')) return;
    this.patientService.delete(id).subscribe(() => this.loadPatients());
  }

  exportToExcel(): void {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:8000/api/export/patients?token=${token}`, '_blank');
  }
}
