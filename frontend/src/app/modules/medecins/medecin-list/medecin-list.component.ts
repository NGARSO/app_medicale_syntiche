import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MedecinService } from '../../../core/services/medecin.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Medecin } from '../../../shared/models/medecin.model';

@Component({
  selector: 'app-medecin-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="topbar">
      <div>
        <div class="topbar-title"><i class="bi bi-person-badge-fill"></i> Médecins</div>
        <div class="topbar-date">{{ totalElements }} médecin(s) enregistré(s)</div>
      </div>
      <div style="display:flex;gap:10px">
        <button (click)="exportToExcel()" class="btn btn-secondary">
          <i class="bi bi-file-earmark-excel"></i> Exporter
        </button>
        <a routerLink="/medecins/new" class="btn btn-primary">
          <i class="bi bi-person-plus"></i> Nouveau médecin
        </a>
      </div>
    </div>

    <div class="page-content">
      <div class="toolbar">
        <div class="search-bar" style="flex:1;max-width:380px">
          <i class="bi bi-search search-icon"></i>
          <input [formControl]="searchControl" type="text" class="form-control"
            placeholder="Nom, prénom, spécialité..." />
        </div>
      </div>

      <div class="card">
        <div class="table-container" [class.content-loading]="loading">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Médecin</th>
                <th>Spécialité</th>
                <th>Matricule</th>
                <th>Téléphone</th>
                <th>Disponibilité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of medecins; let i = index">
                <td style="color:#64748b;font-size:.8rem">{{ i + 1 + currentPage * pageSize }}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#15803d,#22c55e);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.85rem;flex-shrink:0">
                      {{ m.nom.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div style="font-weight:600">Dr. {{ m.nom | uppercase }} {{ m.prenom }}</div>
                      <div style="font-size:.75rem;color:#64748b">{{ m.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge badge-info"><i class="bi bi-stethoscope"></i> {{ m.specialite }}</span>
                </td>
                <td><span style="font-family:monospace;font-size:.82rem">{{ m.matricule }}</span></td>
                <td>{{ m.telephone }}</td>
                <td>
                  <span class="badge" [class]="$any(m).est_disponible_maintenant ? 'badge-success' : 'badge-danger'">
                    <i class="bi" [class.bi-check-circle]="$any(m).est_disponible_maintenant" [class.bi-x-circle]="!$any(m).est_disponible_maintenant"></i>
                    {{ $any(m).est_disponible_maintenant ? 'Disponible' : 'Indisponible' }}
                  </span>
                </td>
                <td>
                  <div style="display:flex;gap:6px">
                    <a [routerLink]="['/medecins', m.id, 'calendar']" class="btn btn-sm btn-info" title="Calendrier">
                      <i class="bi bi-calendar3"></i>
                    </a>
                    <a [routerLink]="['/medecins', m.id, 'edit']" class="btn btn-sm btn-warning" title="Modifier">
                      <i class="bi bi-pencil"></i>
                    </a>
                    <button class="btn btn-sm btn-danger" (click)="deleteMedecin(m.id!)" title="Supprimer">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="medecins.length === 0 && !loading">
                <td colspan="7">
                  <div class="empty-state">
                    <div class="icon"><i class="bi bi-person-badge"></i></div>
                    <p>Aucun médecin trouvé</p>
                    <small>Ajoutez votre premier médecin</small>
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
export class MedecinListComponent implements OnInit {
  private medecinService = inject(MedecinService);
  private loadingService = inject(LoadingService);
  medecins: Medecin[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;
  loading = false;
  searchControl = new FormControl('');
  searchKeyword = '';

  get pageRange(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  ngOnInit(): void {
    this.loadMedecins();
    this.searchControl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(kw => {
      this.searchKeyword = kw || '';
      this.currentPage = 0;
      this.loadMedecins();
    });
  }

  loadMedecins(): void {
    this.loading = true;
    const obs = this.searchKeyword
      ? this.medecinService.search(this.searchKeyword, this.currentPage + 1, this.pageSize)
      : this.medecinService.getAll(this.currentPage + 1, this.pageSize);

    this.loadingService.wrap(obs).subscribe({
      next: (data: any) => {
        this.medecins = data.data || [];
        this.totalElements = data.total || 0;
        this.totalPages = data.last_page || 0;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadMedecins();
  }

  deleteMedecin(id: number): void {
    if (!confirm('Supprimer ce médecin ?')) return;
    this.medecinService.delete(id).subscribe(() => this.loadMedecins());
  }

  exportToExcel(): void {
    const token = localStorage.getItem('token');
    window.open(`/api/export/medecins?token=${token}`, '_blank');
  }
}
