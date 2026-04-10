import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConsultationService } from '../../../core/services/consultation.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './consultation-list.component.html',
  styleUrl: './consultation-list.component.scss'
})
export class ConsultationListComponent implements OnInit {
  private consService = inject(ConsultationService);
  private authService = inject(AuthService);

  consultations: any[] = [];
  loading = false;
  userRole = '';

  ngOnInit() {
    this.userRole = this.authService.getRole();
    this.loadConsultations();
  }

  loadConsultations() {
    this.loading = true;
    this.consService.getAll().subscribe({
      next: (res) => {
        // Supporte à la fois le format paginé (res.data) et le format direct (res)
        this.consultations = res.data || res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getBadgeClass(role: string) {
    return role === 'ADMIN' ? 'badge-info' : 'badge-success';
  }
}
