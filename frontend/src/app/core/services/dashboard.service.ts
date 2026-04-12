import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  role: 'ADMIN' | 'MEDECIN' | 'USER';
  // Commun
  totalRdv: number;
  rdvEnAttente: number;
  rdvConfirme: number;
  rdvAnnule: number;
  rdvTermine: number;
  rdvAujourdhui: number;
  rdvAVenir: number;
  derniersRdv: any[];
  message?: string;

  // ADMIN only
  totalPatients?: number;
  totalMedecins?: number;

  // MEDECIN only
  medecinId?: number;
  medecinNom?: string;
  specialite?: string;

  // USER only
  patientId?: number;
  patientNom?: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>('/api/stats');
  }
}
