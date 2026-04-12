import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medecin } from '../../shared/models/medecin.model';

@Injectable({ providedIn: 'root' })
export class MedecinService {
  private apiUrl = '/api/medecins';

  constructor(private http: HttpClient) {}

  getAll(page = 1, size = 10): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get(this.apiUrl, { params });
  }

  search(keyword: string, page = 1, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page)
      .set('size', size);
    return this.http.get(`${this.apiUrl}/search`, { params });
  }

  getById(id: number): Observable<Medecin> {
    return this.http.get<Medecin>(`${this.apiUrl}/${id}`);
  }

  create(medecin: Medecin): Observable<Medecin> {
    return this.http.post<Medecin>(this.apiUrl, medecin);
  }

  update(id: number, medecin: Medecin): Observable<Medecin> {
    return this.http.put<Medecin>(`${this.apiUrl}/${id}`, medecin);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
