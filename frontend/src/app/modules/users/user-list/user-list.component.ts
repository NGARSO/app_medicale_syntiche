import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="topbar">
      <div>
        <div class="topbar-title"><i class="bi bi-person-gear"></i> Gestion des Utilisateurs</div>
        <div class="topbar-date">{{ totalElements }} utilisateur(s) enregistré(s)</div>
      </div>
      <a routerLink="/users/new" class="btn btn-primary">
        <i class="bi bi-person-plus-fill"></i> Nouvel Utilisateur
      </a>
    </div>

    <div class="page-content">
      <div class="card">
        <div class="table-container" [class.content-loading]="loading">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Date d'inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users; let i = index">
                <td style="color:#64748b;font-size:.8rem">{{ i + 1 + (currentPage - 1) * 10 }}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.85rem;flex-shrink:0">
                      {{ u.username.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div style="font-weight:600">{{ u.username }}</div>
                      <div style="font-size:.75rem;color:#64748b">{{ u.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge" [class]="getRoleClass(u.role)">
                    <i class="bi" [class]="getRoleIcon(u.role)"></i>
                    {{ u.role }}
                  </span>
                </td>
                <td style="font-size:.82rem">{{ u.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    <a [routerLink]="['/users', u.id, 'edit']" class="btn btn-sm btn-warning" title="Modifier">
                      <i class="bi bi-pencil"></i>
                    </a>
                    <button class="btn btn-sm btn-danger" (click)="deleteUser(u.id!)" title="Supprimer">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="users.length === 0 && !loading">
                <td colspan="5">
                  <div class="empty-state">
                    <div class="icon"><i class="bi bi-people"></i></div>
                    <p>Aucun utilisateur trouvé</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer" *ngIf="totalPages > 1">
          <div class="pagination">
            <button class="page-btn" (click)="onPageChange(currentPage - 1)" [disabled]="currentPage === 1"><i class="bi bi-chevron-left"></i></button>
            <button class="page-btn" [class.active]="true">{{ currentPage }}</button>
            <button class="page-btn" (click)="onPageChange(currentPage + 1)" [disabled]="currentPage >= totalPages"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private loadingService = inject(LoadingService);
  users: User[] = [];
  loading = false;
  totalElements = 0;
  totalPages = 0;
  currentPage = 1;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.loadingService.wrap(this.userService.getAll(this.currentPage)).subscribe({
      next: (res) => {
        this.users = res.data;
        this.totalElements = res.total;
        this.totalPages = res.last_page;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  deleteUser(id: number) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.userService.delete(id).subscribe(() => this.loadUsers());
  }

  getRoleClass(role: string): string {
    const map: any = { ADMIN: 'badge-danger', MEDECIN: 'badge-info', USER: 'badge-success' };
    return map[role] || 'badge-secondary';
  }

  getRoleIcon(role: string): string {
    const map: any = { ADMIN: 'bi-shield-fill', MEDECIN: 'bi-person-badge', USER: 'bi-person-heart' };
    return map[role] || 'bi-question';
  }

  getRoleLabel(role: string): string {
    const map: any = { ADMIN: 'ADMIN', MEDECIN: 'MÉDECIN', USER: 'PATIENT' };
    return map[role] || role;
  }
}
