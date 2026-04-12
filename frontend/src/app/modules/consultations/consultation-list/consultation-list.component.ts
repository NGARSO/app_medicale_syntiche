import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConsultationService } from '../../../core/services/consultation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './consultation-list.component.html',
  styleUrl: './consultation-list.component.scss'
})
export class ConsultationListComponent implements OnInit {

  private consService = inject(ConsultationService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  // Données principales
  consultations: any[] = [];
  total = 0;

  // États de chargement
  loading = false;
  loadingMore = false;

  userRole = '';

  // Pagination & Recherche
  currentPage = 1;
  lastPage = 1;
  searchTerm = '';

  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.userRole = this.authService.getRole();
    this.loadConsultations();                    // Chargement initial

    // Recherche avec debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term.trim();
      this.resetAndLoad();
    });
  }

  // ==================== RECHERCHE ====================
  onSearch(event: any) {
    this.searchSubject.next(event.target.value);
  }

  // ==================== CHARGEMENT DES DONNÉES ====================
  loadConsultations() {
    if (this.currentPage === 1) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    this.consService.getAll(this.currentPage, 15, this.searchTerm).subscribe({
      next: (res) => {
        const newData = res.data || (Array.isArray(res) ? res : []);

        // Dès que les données arrivent → on les affiche immédiatement
        if (this.currentPage === 1) {
          this.consultations = newData;           // Remplace tout
        } else {
          this.consultations = [...this.consultations, ...newData]; // Ajoute à la suite
        }

        this.total = res.total || 0;
        this.lastPage = res.last_page || 1;

        // Fin des chargements
        this.loading = false;
        this.loadingMore = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement consultations:', err);
        this.loading = false;
        this.loadingMore = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Réinitialise et recharge (utilisé pour la recherche)
  resetAndLoad() {
    this.currentPage = 1;
    this.consultations = [];        // Vide immédiatement l'ancien contenu
    this.loadConsultations();
  }

  // Charger plus de données (pagination infinie)
  loadMore() {
    if (this.currentPage < this.lastPage && !this.loadingMore) {
      this.currentPage++;
      this.loadConsultations();
    }
  }

  // Réinitialiser la recherche depuis le template
  clearSearch() {
    this.searchTerm = '';
    this.resetAndLoad();
  }
}
