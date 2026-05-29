import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface IgdbCover {
    id: number;
    url: string;
    game_name: string;
}

export interface IgdbGame {
    id: number;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class IgdbService {
    private apiUrl = 'https://api.ggdb.app/request';
    private http = inject(HttpClient);

    searchCovers(name: string, username: string): Observable<IgdbCover[]> {
        const url = `${this.apiUrl}?action=igdb-covers&name=${encodeURIComponent(name)}&username=${encodeURIComponent(username)}`;
        return this.http.get<IgdbCover[]>(url, { withCredentials: true }).pipe(
            catchError(() => of([]))
        );
    }

    suggestGames(name: string, username: string): Observable<IgdbGame[]> {
        const url = `${this.apiUrl}?action=igdb-suggestions&name=${encodeURIComponent(name)}&username=${encodeURIComponent(username)}`;
        return this.http.get<IgdbGame[]>(url, { withCredentials: true }).pipe(
            catchError(() => of([]))
        );
    }
}
