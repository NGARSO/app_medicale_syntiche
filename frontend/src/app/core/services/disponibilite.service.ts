import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Disponibilite {
  id?: number;
  medecin_id: number;
  jour_semaine: number; // 0-6
  heure_debut: string;
  heure_fin: string;
  actif: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DisponibiliteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/disponibilites';

  getByMedecin(medecinId: number): Observable<Disponibilite[]> {
    return this.http.get<Disponibilite[]>(`${this.apiUrl}?medecin_id=${medecinId}`);
  }

  create(disp: Disponibilite): Observable<Disponibilite> {
    return this.http.post<Disponibilite>(this.apiUrl, disp);
  }

  update(id: number, disp: Partial<Disponibilite>): Observable<Disponibilite> {
    return this.http.put<Disponibilite>(`${this.apiUrl}/${id}`, disp);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
