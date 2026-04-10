import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MedecinService } from '../../../core/services/medecin.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Medecin } from '../../../shared/models/medecin.model';

@Component({
  selector: 'app-planning-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="topbar">
      <div>
        <div class="topbar-title"><i class="bi bi-calendar-check"></i> Planification</div>
        <div style="display:flex;gap:12px;align-items:center">
          <a routerLink="/planning/calendar" class="btn btn-primary">
            📅 Agenda RDVs
          </a>
          <span style="opacity:0.7">Disponibilités médecins</span>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="card">
        <div class="table-container" [class.content-loading]="loading">
          <table>
            <thead>
              <tr>
                <th>Médecin</th>
                <th>Spécialité</th>
                <th>Statut Actuel</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of medecins">
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.85rem;flex-shrink:0">
                      {{ m.nom.charAt(0).toUpperCase() }}
                    </div>
                    <strong>Dr. {{ m.nom | uppercase }} {{ m.prenom }}</strong>
                  </div>
                </td>
                <td><span class="badge badge-info">{{ m.specialite }}</span></td>
                <td>
                  <span class="badge" [class]="$any(m).est_disponible_maintenant ? 'badge-success' : 'badge-danger'">
                    <i class="bi" [class.bi-check-circle]="$any(m).est_disponible_maintenant" [class.bi-x-circle]="!$any(m).est_disponible_maintenant"></i>
                    {{ $any(m).est_disponible_maintenant ? 'Disponible' : 'Indisponible' }}
                  </span>
                </td>
                <td>
                  <a [routerLink]="['/medecins', m.id, 'calendar']" class="btn btn-sm btn-primary">
                    <i class="bi bi-calendar3"></i> Gérer l'emploi du temps
                  </a>
                </td>
              </tr>
              <tr *ngIf="medecins.length === 0 && !loading">
                 <td colspan="4">
                  <div class="empty-state">
                    <div class="icon"><i class="bi bi-person-badge"></i></div>
                    <p>Aucun médecin trouvé</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PlanningListComponent implements OnInit {
  private medService = inject(MedecinService);
  private loadingService = inject(LoadingService);
  medecins: Medecin[] = [];
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.loadingService.wrap(this.medService.getAll(1, 100)).subscribe({
      next: (res: any) => {
        this.medecins = res.data || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
