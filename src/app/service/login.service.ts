import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

    private username: string | null = null;

    constructor() {}

    setUsername(username: string | null): void {
        this.username = username ? username.toLowerCase() : null;
    }

    getUsername(): string | null {
        return this.username;
    }

    setLoggedIn(state: boolean): void {
        this.isAuthenticatedSubject.next(state);

        if (!state) {
            this.username = null;
        }
    }

    isLoggedIn(): boolean {
        return this.isAuthenticatedSubject.value;
    }
}
