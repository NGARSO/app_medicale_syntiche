import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdonnanceService } from '../../../core/services/ordonnance.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-ordonnance-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ordonnance-list.component.html',
  styleUrl: './ordonnance-list.component.scss'
})
export class OrdonnanceListComponent implements OnInit {
  private ordService = inject(OrdonnanceService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ordonnances: any[] = [];
  loading = false;
  loadingMore = false;
  userRole = '';

  // Pagination & Search
  currentPage = 1;
  lastPage = 1;
  total = 0;
  searchTerm = '';
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.userRole = this.authService.getRole();
    this.loadOrdonnances();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.resetAndLoad();
    });
  }

  onSearch(event: any) {
    this.searchSubject.next(event.target.value);
  }

  resetAndLoad() {
    this.currentPage = 1;
    this.ordonnances = [];
    this.loadOrdonnances();
  }

  loadOrdonnances() {
    if (this.currentPage === 1) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    this.ordService.getAll(this.currentPage, 15, this.searchTerm).subscribe({
      next: (res) => {
        const newData = res.data || (Array.isArray(res) ? res : []);
        
        if (this.currentPage === 1) {
          this.ordonnances = newData;
        } else {
          this.ordonnances = [...this.ordonnances, ...newData];
        }

        this.lastPage = res.last_page || 1;
        this.total = res.total || this.ordonnances.length;
        this.loading = false;
        this.loadingMore = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.loadingMore = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMore() {
    if (this.currentPage < this.lastPage && !this.loadingMore) {
      this.currentPage++;
      this.loadOrdonnances();
    }
  }

  deleteOrdonnance(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ordonnance ?')) {
      this.ordService.delete(id).subscribe(() => this.resetAndLoad());
    }
  }
}
