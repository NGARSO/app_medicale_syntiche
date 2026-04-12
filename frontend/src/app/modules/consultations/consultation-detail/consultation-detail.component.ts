import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConsultationService } from '../../../core/services/consultation.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-consultation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './consultation-detail.component.html',
  styleUrl: './consultation-detail.component.scss'
})
export class ConsultationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private consService = inject(ConsultationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  consultation: any;
  loading = true;
  userRole = '';

  ngOnInit() {
    this.userRole = this.authService.getRole();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDetails(+id);
    }
  }

  loadDetails(id: number) {
    this.loading = true;
    this.consService.getById(id).subscribe({
      next: (res) => {
        this.consultation = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  windowPrint() {
    window.print();
  }

  generateOrdonnance() {
    this.router.navigate(['/ordonnances/new'], { 
      queryParams: { consultationId: this.consultation.id } 
    });
  }
}
