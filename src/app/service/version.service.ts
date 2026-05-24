import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class VersionService {
    private readonly version = '4.2.7';

    getVersion(): string {
        return this.version;
    }
}
