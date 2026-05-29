import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

    private username: string | null = localStorage.getItem('username');

    constructor() {
        if (this.username) {
            this.isAuthenticatedSubject.next(true);
        }
    }

    setUsername(username: string | null): void {
        this.username = username ? username.toLowerCase() : null;
        if (this.username) {
            localStorage.setItem('username', this.username);
        } else {
            localStorage.removeItem('username');
        }
    }

    getUsername(): string | null {
        return this.username;
    }

    setLoggedIn(state: boolean): void {
        this.isAuthenticatedSubject.next(state);

        if (!state) {
            this.setUsername(null);
        }
    }

    isLoggedIn(): boolean {
        return this.isAuthenticatedSubject.value;
    }
}
