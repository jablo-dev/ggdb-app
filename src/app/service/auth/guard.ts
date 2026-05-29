import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../login.service';
import { DataService } from '../data.service';

export const authGuard: CanActivateFn = () => {
    const loginService = inject(LoginService);
    const router = inject(Router);

    if (loginService.isLoggedIn()) {
        return true;
    } else {
        router.navigate(['/auth/login']);
        return false;
    }
};

export const adminGuard: CanActivateFn = () => {
    const dataService = inject(DataService);
    const router = inject(Router);

    if (dataService.getIsAdmin()) {
        return true;
    } else {
        router.navigate(['/']);
        return false;
    }
};
