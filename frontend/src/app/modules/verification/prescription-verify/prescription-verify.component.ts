import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrdonnanceService } from '../../../core/services/ordonnance.service';

@Component({
  selector: 'app-prescription-verify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prescription-verify.component.html',
  styleUrl: './prescription-verify.component.scss'
})
export class PrescriptionVerifyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ordService = inject(OrdonnanceService);

  verificationResult: any = null;
  loading = true;
  error = false;

  ngOnInit() {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.verify(code);
    }
  }

  verify(code: string) {
    this.loading = true;
    this.ordService.verify(code).subscribe({
      next: (res) => {
        this.verificationResult = res;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }
}
