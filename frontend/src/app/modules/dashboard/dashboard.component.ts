import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective, DatePipe],
  template: `
    <!-- ═══════ TOPBAR ═══════ -->
    <div class="topbar">
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%">
        <div>
          <div class="topbar-title"><i class="bi bi-speedometer2"></i> Tableau de bord</div>
          <div class="topbar-date">{{ greeting }} — {{ today }}</div>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <span class="badge" [ngClass]="{
            'badge-info': role === 'ADMIN',
            'badge-success': role === 'MEDECIN',
            'badge-warning': role === 'USER'
          }">
            <i class="bi" [ngClass]="{
              'bi-shield-check': role === 'ADMIN',
              'bi-person-badge': role === 'MEDECIN',
              'bi-person': role === 'USER'
            }"></i>
            {{ role }}
          </span>
          <button *ngIf="role === 'ADMIN'" (click)="exportAll()" class="btn btn-secondary btn-sm" [disabled]="loading">
            <i class="bi bi-file-earmark-excel"></i> Exporter
          </button>
        </div>
      </div>
    </div>

    <div class="page-content" [class.content-loading]="loading">

      <!-- ═══════ MESSAGE D'ALERTE (compte non lié) ═══════ -->
      <div *ngIf="stats && stats.message" class="alert alert-info" style="margin-bottom:20px">
        <i class="bi bi-info-circle"></i> {{ stats.message }}
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- ═══════ DASHBOARD ADMIN — VUE GLOBALE ═══════ -->
      <!-- ═══════════════════════════════════════════════ -->
      <ng-container *ngIf="role === 'ADMIN' && stats">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card blue">
            <div class="stat-label">Total Patients</div>
            <div class="stat-value">{{ stats.totalPatients }}</div>
            <div class="stat-icon"><i class="bi bi-people"></i></div>
          </div>
          <div class="stat-card green">
            <div class="stat-label">Total Médecins</div>
            <div class="stat-value">{{ stats.totalMedecins }}</div>
            <div class="stat-icon"><i class="bi bi-person-badge"></i></div>
          </div>
          <div class="stat-card purple">
            <div class="stat-label">RDV Aujourd'hui</div>
            <div class="stat-value">{{ stats.rdvAujourdhui }}</div>
            <div class="stat-icon"><i class="bi bi-calendar-check"></i></div>
          </div>
          <div class="stat-card amber">
            <div class="stat-label">RDV En attente</div>
            <div class="stat-value">{{ stats.rdvEnAttente }}</div>
            <div class="stat-icon"><i class="bi bi-hourglass-split"></i></div>
          </div>
          <div class="stat-card cyan">
            <div class="stat-label">Total RDV</div>
            <div class="stat-value">{{ stats.totalRdv }}</div>
            <div class="stat-icon"><i class="bi bi-calendar-event"></i></div>
          </div>
          <div class="stat-card red">
            <div class="stat-label">RDV Annulés</div>
            <div class="stat-value">{{ stats.rdvAnnule }}</div>
            <div class="stat-icon"><i class="bi bi-x-circle"></i></div>
          </div>
        </div>

        <!-- Charts -->
        <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:20px">
          <div class="card">
            <div class="card-body">
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:20px">
                <i class="bi bi-graph-up" style="color:var(--primary)"></i> Répartition des statuts
              </h3>
              <div style="height:300px">
                <canvas baseChart [data]="barChartData" [options]="barChartOptions" [type]="barChartType"></canvas>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:20px">
                <i class="bi bi-pie-chart" style="color:var(--success)"></i> Statuts RDV
              </h3>
              <div style="height:250px">
                <canvas baseChart [data]="pieChartData" [options]="pieChartOptions" [type]="pieChartType"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions + Derniers RDV -->
        <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:20px;margin-top:20px">
          <div class="card">
            <div class="card-body">
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:20px"><i class="bi bi-lightning-charge"></i> Actions rapides</h3>
              <div style="display:flex;flex-direction:column;gap:10px">
                <a routerLink="/patients/new" class="btn btn-primary"><i class="bi bi-person-plus"></i> Nouveau patient</a>
                <a routerLink="/medecins/new" class="btn btn-success"><i class="bi bi-person-badge"></i> Nouveau médecin</a>
                <a routerLink="/rendez-vous/new" class="btn btn-warning"><i class="bi bi-calendar-plus"></i> Nouveau RDV</a>
                <a routerLink="/users" class="btn btn-secondary"><i class="bi bi-gear"></i> Gérer utilisateurs</a>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px"><i class="bi bi-clock-history"></i> Derniers rendez-vous</h3>
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Médecin</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let rdv of stats.derniersRdv">
                      <td style="font-weight:500">{{ rdv.patient?.nom }} {{ rdv.patient?.prenom }}</td>
                      <td>Dr. {{ rdv.medecin?.nom }}</td>
                      <td style="font-size:.82rem">{{ rdv.date_heure | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td><span class="badge badge-dot" [ngClass]="getStatusBadge(rdv.statut)">{{ getStatusLabel(rdv.statut) }}</span></td>
                    </tr>
                    <tr *ngIf="stats.derniersRdv && stats.derniersRdv.length === 0"><td colspan="4" style="text-align:center;color:#64748b;padding:20px">Aucun rendez-vous</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ═══════════════════════════════════════════════════ -->
      <!-- ═══════ DASHBOARD MEDECIN — MES RENDEZ-VOUS ═══════ -->
      <!-- ═══════════════════════════════════════════════════ -->
      <ng-container *ngIf="role === 'MEDECIN' && stats">
        <!-- Bienvenue Médecin -->
        <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,#15803d,#22c55e);color:#fff;border:none">
          <div class="card-body" style="display:flex;align-items:center;gap:20px">
            <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:1.8rem">
              <i class="bi bi-person-badge"></i>
            </div>
            <div>
              <h2 style="font-size:1.4rem;font-weight:800;margin-bottom:4px">{{ stats.medecinNom || 'Docteur' }}</h2>
              <p style="opacity:.85;font-size:.9rem">{{ stats.specialite || 'Spécialité' }} — Tableau de bord personnel</p>
            </div>
          </div>
        </div>

        <!-- Stats Cards Médecin -->
        <div class="stats-grid">
          <div class="stat-card blue">
            <div class="stat-label">Mes patients</div>
            <div class="stat-value">{{ stats.totalPatients }}</div>
            <div class="stat-icon"><i class="bi bi-people"></i></div>
          </div>
          <div class="stat-card purple">
            <div class="stat-label">RDV Aujourd'hui</div>
            <div class="stat-value">{{ stats.rdvAujourdhui }}</div>
            <div class="stat-icon"><i class="bi bi-calendar-check"></i></div>
          </div>
          <div class="stat-card amber">
            <div class="stat-label">En attente</div>
            <div class="stat-value">{{ stats.rdvEnAttente }}</div>
            <div class="stat-icon"><i class="bi bi-hourglass-split"></i></div>
          </div>
          <div class="stat-card green">
            <div class="stat-label">Confirmés</div>
            <div class="stat-value">{{ stats.rdvConfirme }}</div>
            <div class="stat-icon"><i class="bi bi-check-circle"></i></div>
          </div>
        </div>

        <!-- Chart + Prochains RDV -->
        <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:20px">
          <div class="card">
            <div class="card-body">
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:20px">
                <i class="bi bi-pie-chart" style="color:var(--success)"></i> Mes statuts RDV
              </h3>
              <div style="height:250px">
                <canvas baseChart [data]="pieChartData" [options]="pieChartOptions" [type]="pieChartType"></canvas>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px"><i class="bi bi-calendar-week"></i> Mes prochains rendez-vous</h3>
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Date & Heure</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let rdv of stats.derniersRdv">
                      <td>
                        <div style="display:flex;align-items:center;gap:8px">
                          <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#1e40af,#3b82f6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.75rem">
                            {{ rdv.patient?.nom?.charAt(0) || '?' }}
                          </div>
                          <span style="font-weight:500">{{ rdv.patient?.nom }} {{ rdv.patient?.prenom }}</span>
                        </div>
                      </td>
                      <td style="font-size:.82rem">{{ rdv.date_heure | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td><span class="badge badge-dot" [ngClass]="getStatusBadge(rdv.statut)">{{ getStatusLabel(rdv.statut) }}</span></td>
                    </tr>
                    <tr *ngIf="stats.derniersRdv && stats.derniersRdv.length === 0"><td colspan="3" style="text-align:center;color:#64748b;padding:24px">Aucun rendez-vous à venir</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Médecin -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px">
          <a routerLink="/rendez-vous" class="card" style="text-decoration:none;cursor:pointer;transition:all .3s ease">
            <div class="card-body" style="text-align:center;padding:24px">
              <i class="bi bi-calendar-event" style="font-size:2rem;color:var(--primary);margin-bottom:8px;display:block"></i>
              <div style="font-weight:700;color:var(--text)">Mes rendez-vous</div>
              <div style="font-size:.8rem;color:var(--text-muted);margin-top:4px">{{ stats.totalRdv }} au total</div>
            </div>
          </a>
          <a routerLink="/planning" class="card" style="text-decoration:none;cursor:pointer;transition:all .3s ease">
            <div class="card-body" style="text-align:center;padding:24px">
              <i class="bi bi-calendar-week" style="font-size:2rem;color:var(--success);margin-bottom:8px;display:block"></i>
              <div style="font-weight:700;color:var(--text)">Mon planning</div>
              <div style="font-size:.8rem;color:var(--text-muted);margin-top:4px">Voir mon calendrier</div>
            </div>
          </a>
          <a routerLink="/patients" class="card" style="text-decoration:none;cursor:pointer;transition:all .3s ease">
            <div class="card-body" style="text-align:center;padding:24px">
              <i class="bi bi-people" style="font-size:2rem;color:var(--purple);margin-bottom:8px;display:block"></i>
              <div style="font-weight:700;color:var(--text)">Mes patients</div>
              <div style="font-size:.8rem;color:var(--text-muted);margin-top:4px">{{ stats.totalPatients }} patient(s)</div>
            </div>
          </a>
        </div>
      </ng-container>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- ═══════ DASHBOARD USER (PATIENT) — MES INFOS ═══════ -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <ng-container *ngIf="role === 'USER' && stats">
        <!-- Bienvenue Patient -->
        <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;border:none">
          <div class="card-body" style="display:flex;align-items:center;gap:20px">
            <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:1.8rem">
              <i class="bi bi-person-heart"></i>
            </div>
            <div>
              <h2 style="font-size:1.4rem;font-weight:800;margin-bottom:4px">Bienvenue, {{ stats.patientNom || userName }}</h2>
              <p style="opacity:.85;font-size:.9rem">Voici le résumé de vos rendez-vous médicaux</p>
            </div>
          </div>
        </div>

        <!-- Stats Cards Patient -->
        <div class="stats-grid">
          <div class="stat-card blue">
            <div class="stat-label">Total RDV</div>
            <div class="stat-value">{{ stats.totalRdv }}</div>
            <div class="stat-icon"><i class="bi bi-calendar-event"></i></div>
          </div>
          <div class="stat-card purple">
            <div class="stat-label">RDV Aujourd'hui</div>
            <div class="stat-value">{{ stats.rdvAujourdhui }}</div>
            <div class="stat-icon"><i class="bi bi-calendar-check"></i></div>
          </div>
          <div class="stat-card amber">
            <div class="stat-label">En attente</div>
            <div class="stat-value">{{ stats.rdvEnAttente }}</div>
            <div class="stat-icon"><i class="bi bi-hourglass-split"></i></div>
          </div>
          <div class="stat-card green">
            <div class="stat-label">À venir</div>
            <div class="stat-value">{{ stats.rdvAVenir }}</div>
            <div class="stat-icon"><i class="bi bi-calendar-plus"></i></div>
          </div>
        </div>

        <!-- Chart + Prochains RDV -->
        <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:20px">
          <div class="card">
            <div class="card-body">
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:20px">
                <i class="bi bi-pie-chart" style="color:var(--primary)"></i> Mes statuts RDV
              </h3>
              <div style="height:250px">
                <canvas baseChart [data]="pieChartData" [options]="pieChartOptions" [type]="pieChartType"></canvas>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px"><i class="bi bi-calendar-heart"></i> Mes prochains rendez-vous</h3>
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Médecin</th>
                      <th>Spécialité</th>
                      <th>Date & Heure</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let rdv of stats.derniersRdv">
                      <td style="font-weight:500">Dr. {{ rdv.medecin?.nom }} {{ rdv.medecin?.prenom }}</td>
                      <td><span class="badge badge-info">{{ rdv.medecin?.specialite }}</span></td>
                      <td style="font-size:.82rem">{{ rdv.date_heure | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td><span class="badge badge-dot" [ngClass]="getStatusBadge(rdv.statut)">{{ getStatusLabel(rdv.statut) }}</span></td>
                    </tr>
                    <tr *ngIf="stats.derniersRdv && stats.derniersRdv.length === 0"><td colspan="4" style="text-align:center;color:#64748b;padding:24px">Aucun rendez-vous à venir</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Patient -->
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:20px">
          <a routerLink="/rendez-vous" class="card" style="text-decoration:none;cursor:pointer;transition:all .3s ease">
            <div class="card-body" style="text-align:center;padding:24px">
              <i class="bi bi-calendar-event" style="font-size:2rem;color:var(--primary);margin-bottom:8px;display:block"></i>
              <div style="font-weight:700;color:var(--text)">Voir mes rendez-vous</div>
              <div style="font-size:.8rem;color:var(--text-muted);margin-top:4px">Historique complet</div>
            </div>
          </a>
          <a routerLink="/profile" class="card" style="text-decoration:none;cursor:pointer;transition:all .3s ease">
            <div class="card-body" style="text-align:center;padding:24px">
              <i class="bi bi-person-circle" style="font-size:2rem;color:var(--success);margin-bottom:8px;display:block"></i>
              <div style="font-weight:700;color:var(--text)">Mon profil</div>
              <div style="font-size:.8rem;color:var(--text-muted);margin-top:4px">Modifier mes informations</div>
            </div>
          </a>
        </div>
      </ng-container>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  role: string = 'USER';
  userName: string = '';
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);

  // Bar chart (ADMIN uniquement)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['En attente', 'Confirmé', 'Annulé', 'Terminé'],
    datasets: [{
      data: [0, 0, 0, 0],
      label: 'RDV',
      backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#6b7280'],
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  // Pie chart (tous les rôles)
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }
  };
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = {
    labels: ['En attente', 'Confirmé', 'Annulé', 'Terminé'],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#6b7280'] }]
  };

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.userName = this.authService.getUser()?.username || 'Utilisateur';

    this.loadingService.wrap(this.dashboardService.getStats()).subscribe({
      next: (data) => {
        this.stats = data;
        this.role = data.role; // Le backend fait autorité sur le rôle
        this.loading = false;
        this.updateCharts();
      },
      error: () => this.loading = false
    });
  }

  updateCharts(): void {
    if (!this.stats) return;

    // Pie chart — tous les rôles
    this.pieChartData = {
      labels: ['En attente', 'Confirmé', 'Annulé', 'Terminé'],
      datasets: [{
        data: [
          this.stats.rdvEnAttente,
          this.stats.rdvConfirme,
          this.stats.rdvAnnule,
          this.stats.rdvTermine
        ],
        backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#6b7280']
      }]
    };

    // Bar chart — ADMIN seulement
    if (this.role === 'ADMIN') {
      this.barChartData = {
        labels: ['En attente', 'Confirmé', 'Annulé', 'Terminé'],
        datasets: [{
          data: [
            this.stats.rdvEnAttente,
            this.stats.rdvConfirme,
            this.stats.rdvAnnule,
            this.stats.rdvTermine
          ],
          label: 'RDV',
          backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#6b7280'],
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }
  }

  getStatusBadge(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'badge-warning',
      'CONFIRME': 'badge-success',
      'ANNULE': 'badge-danger',
      'TERMINE': 'badge-secondary'
    };
    return map[statut] || 'badge-info';
  }

  getStatusLabel(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'CONFIRME': 'Confirmé',
      'ANNULE': 'Annulé',
      'TERMINE': 'Terminé'
    };
    return map[statut] || statut;
  }

  exportAll(): void {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:8000/api/export/rendez-vous?token=${token}`, '_blank');
  }
}
