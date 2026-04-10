import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdonnanceService } from '../../../core/services/ordonnance.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-ordonnance-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ordonnance-list.component.html',
  styleUrl: './ordonnance-list.component.scss'
})
export class OrdonnanceListComponent implements OnInit {
  private ordService = inject(OrdonnanceService);
  private authService = inject(AuthService);

  ordonnances: any[] = [];
  loading = false;
  userRole = '';

  ngOnInit() {
    this.userRole = this.authService.getRole();
    this.loadOrdonnances();
  }

  loadOrdonnances() {
    this.loading = true;
    this.ordService.getAll().subscribe({
      next: (res) => {
        this.ordonnances = res.data || res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  deleteOrdonnance(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ordonnance ?')) {
      this.ordService.delete(id).subscribe(() => this.loadOrdonnances());
    }
  }
}
