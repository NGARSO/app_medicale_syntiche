import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="progress-bar-container" *ngIf="loading()">
      <div class="progress-bar-value"></div>
    </div>
    <router-outlet />
  `,
  styleUrl: './app.scss'
})
export class App {
  private loadingService = inject(LoadingService);
  loading = this.loadingService.loading;
}
