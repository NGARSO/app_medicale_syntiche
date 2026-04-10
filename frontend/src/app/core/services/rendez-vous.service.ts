import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RendezVousService {
private apiUrl = 'http://localhost:8000/api/rendez-vous';

  constructor(private http: HttpClient) {}

  getAll(filters: { statut?: string; medecinId?: number } = {}, page = 1, size = 10): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters.statut) params = params.set('statut', filters.statut);
    if (filters.medecinId) params = params.set('medecinId', filters.medecinId);
    return this.http.get(this.apiUrl, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(rdv: any): Observable<any> {
    return this.http.post(this.apiUrl, rdv);
  }

  update(id: number, rdv: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, rdv);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
