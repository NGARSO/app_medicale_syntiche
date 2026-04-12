import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private http = inject(HttpClient);
  private apiUrl = '/api/consultations';

  getAll(page: number = 1, size: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get(this.apiUrl, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
