import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = '/api';
    private loggedIn$: BehaviorSubject<boolean>;

    constructor(
        private http: HttpClient,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        // Initialisation immédiate au démarrage (essentiel pour le rafraîchissement F5)
        const tokenExists = this.checkToken();
        this.loggedIn$ = new BehaviorSubject<boolean>(tokenExists);
    }

    private checkToken(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            return !!localStorage.getItem('token');
        }
        return false;
    }

    login(credentials: { username: string; password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((res: any) => {
                if (isPlatformBrowser(this.platformId)) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('user', JSON.stringify(res.user));
                }
                this.loggedIn$.next(true);
            }),
            catchError(err => {
                console.group('AuthService Login Error');
                console.error('Status:', err.status);
                console.error('Message:', err.message);
                console.error('Error Body:', err.error);
                console.groupEnd();
                return throwError(() => err);
            })
        );
    }

    register(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, data);
    }

    logout(): void {
        this.http.post(`${this.apiUrl}/logout`, {}).subscribe({ error: () => {} });
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        this.loggedIn$.next(false);
        this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        return this.loggedIn$.value;
    }

    isLoggedIn$(): Observable<boolean> {
        return this.loggedIn$.asObservable();
    }

    getUser(): any {
        if (isPlatformBrowser(this.platformId)) {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        }
        return null;
    }

    getRole(): string {
        return this.getUser()?.role || 'USER';
    }
}
