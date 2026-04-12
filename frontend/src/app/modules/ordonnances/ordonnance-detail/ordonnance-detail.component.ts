import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdonnanceService } from '../../../core/services/ordonnance.service';

@Component({
  selector: 'app-ordonnance-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ordonnance-detail.component.html',
  styleUrl: './ordonnance-detail.component.scss'
})
export class OrdonnanceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ordService = inject(OrdonnanceService);
  private cdr = inject(ChangeDetectorRef);

  ordonnance: any;
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrdonnance(+id);
    }
  }

  loadOrdonnance(id: number) {
    this.loading = true;
    this.ordService.getById(id).subscribe({
      next: (res) => {
        this.ordonnance = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  print() {
    window.print();
  }
}
