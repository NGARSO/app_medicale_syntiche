import { Injectable, signal } from '@angular/core';
import { finalize, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCount = 0;
  private _loading = signal<boolean>(false);
  
  loading = this._loading.asReadonly();

  show() {
    this.loadingCount++;
    this._loading.set(true);
  }

  hide() {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0) {
      this._loading.set(false);
    }
  }

  /**
   * Wraps an observable with show/hide loading calls
   */
  wrap<T>(obs$: Observable<T>): Observable<T> {
    this.show();
    return obs$.pipe(
      finalize(() => this.hide())
    );
  }
}
