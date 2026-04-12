import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <!-- SIDEBAR -->
      <aside class="sidebar no-print" [class.collapsed]="isCollapsed">
        <button class="sidebar-toggle-btn" (click)="toggleSidebar()" [title]="isCollapsed ? 'Dérouler' : 'Réduire'">
          <i class="bi" [class.bi-chevron-right]="isCollapsed" [class.bi-chevron-left]="!isCollapsed"></i>
        </button>

        <div class="sidebar-brand">
          <h2 *ngIf="!isCollapsed"><i class="bi bi-hospital text-primary"></i> CliniquePro</h2>
          <h2 *ngIf="isCollapsed"><i class="bi bi-hospital"></i></h2>
          <p *ngIf="!isCollapsed">Système de gestion médicale</p>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-label" *ngIf="!isCollapsed">Navigation</div>

          <!-- Dashboard — visible par tous -->
          <a class="nav-item" routerLink="/dashboard" routerLinkActive="active" title="Tableau de bord">
            <i class="bi bi-speedometer2 icon"></i>
            <span *ngIf="!isCollapsed">Tableau de bord</span>
          </a>

          <!-- ═══ ADMIN & MEDECIN : Gestion ═══ -->
          <ng-container *ngIf="userRole === 'ADMIN' || userRole === 'MEDECIN'">
            <div class="nav-section-label" *ngIf="!isCollapsed" style="margin-top:12px">Gestion</div>

            <a class="nav-item" routerLink="/patients" routerLinkActive="active" title="Patients">
              <i class="bi bi-people-fill icon"></i>
              <span *ngIf="!isCollapsed">Patients</span>
            </a>

            <!-- Médecins : visible uniquement pour ADMIN -->
            <a *ngIf="userRole === 'ADMIN'" class="nav-item" routerLink="/medecins" routerLinkActive="active" title="Médecins">
              <i class="bi bi-person-badge-fill icon"></i>
              <span *ngIf="!isCollapsed">Médecins</span>
            </a>

            <a class="nav-item" routerLink="/planning" routerLinkActive="active" title="Planification">
              <i class="bi bi-calendar-check icon"></i>
              <span *ngIf="!isCollapsed">Planification</span>
            </a>

            <a class="nav-item" routerLink="/rendez-vous" routerLinkActive="active" title="Rendez-vous">
              <i class="bi bi-calendar-event icon"></i>
              <span *ngIf="!isCollapsed">Rendez-vous</span>
            </a>

            <a class="nav-item" routerLink="/consultations" routerLinkActive="active" title="Consultations">
              <i class="bi bi-folder2-open icon"></i>
              <span *ngIf="!isCollapsed">Consultations</span>
            </a>

            <a class="nav-item" routerLink="/ordonnances" routerLinkActive="active" title="Ordonnances">
              <i class="bi bi-prescription2 icon"></i>
              <span *ngIf="!isCollapsed">Ordonnances</span>
            </a>
          </ng-container>

          <!-- ═══ USER (Patient) : Mes infos ═══ -->
          <ng-container *ngIf="userRole === 'USER'">
            <div class="nav-section-label" *ngIf="!isCollapsed" style="margin-top:12px">Mes informations</div>

            <a class="nav-item" routerLink="/rendez-vous" routerLinkActive="active" title="Mes rendez-vous">
              <i class="bi bi-calendar-event icon"></i>
              <span *ngIf="!isCollapsed">Mes rendez-vous</span>
            </a>

            <a class="nav-item" routerLink="/consultations" routerLinkActive="active" title="Mes consultations">
              <i class="bi bi-folder2-open icon"></i>
              <span *ngIf="!isCollapsed">Mes consultations</span>
            </a>

            <a class="nav-item" routerLink="/ordonnances" routerLinkActive="active" title="Mes ordonnances">
              <i class="bi bi-prescription2 icon"></i>
              <span *ngIf="!isCollapsed">Mes ordonnances</span>
            </a>
          </ng-container>

          <!-- ═══ Profil — visible par tous ═══ -->
          <div class="nav-section-label" *ngIf="!isCollapsed" style="margin-top:12px">Compte</div>

          <a class="nav-item" routerLink="/profile" routerLinkActive="active" title="Mon Profil">
            <i class="bi bi-person-circle icon"></i>
            <span *ngIf="!isCollapsed">Mon Profil</span>
          </a>

          <!-- ═══ ADMIN seulement : Administration ═══ -->
          <ng-container *ngIf="userRole === 'ADMIN'">
            <div class="nav-section-label" *ngIf="!isCollapsed" style="margin-top:12px">Administration</div>
            <a class="nav-item" routerLink="/users" routerLinkActive="active" title="Utilisateurs">
              <i class="bi bi-gear-fill icon"></i>
              <span *ngIf="!isCollapsed">Utilisateurs</span>
            </a>
          </ng-container>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user" [class.p-1]="isCollapsed">
            <div class="avatar" [title]="userName">
              <img *ngIf="user?.photo_profil" [src]="'/storage/' + user.photo_profil" 
                style="width:100%;height:100%;object-fit:cover;border-radius:50%">
              <span *ngIf="!user?.photo_profil">{{ userInitial }}</span>
            </div>
            <div class="info" *ngIf="!isCollapsed">
              <div class="name">{{ userName }}</div>
              <div class="role">
                <span class="badge" style="font-size:.6rem;padding:2px 6px" [ngClass]="{
                  'badge-info': userRole === 'ADMIN',
                  'badge-success': userRole === 'MEDECIN',
                  'badge-warning': userRole === 'USER'
                }">{{ userRole }}</span>
              </div>
            </div>
            <button class="btn-logout" (click)="logout()" title="Se déconnecter" *ngIf="!isCollapsed">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </div>
          <button class="btn-logout w-100 mt-2" (click)="logout()" title="Se déconnecter" *ngIf="isCollapsed">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <div class="main-content" [class.sidebar-collapsed]="isCollapsed">
        <router-outlet />
      </div>
    </div>
  `
})
export class LayoutComponent {
  user: any;
  isCollapsed: boolean = false;

  constructor(private authService: AuthService) {
    this.user = this.authService.getUser();
  }

  get userName(): string {
    return this.user?.username || 'Utilisateur';
  }

  get userRole(): string {
    return this.user?.role || 'USER';
  }

  get userInitial(): string {
    return (this.user?.username || 'U').charAt(0).toUpperCase();
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }
}
