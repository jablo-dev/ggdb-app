import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class VersionService {
    private readonly version = '4.3.2';

    getVersion(): string {
        return this.version;
    }
}
