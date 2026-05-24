import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from './app/service/auth/guard';
import { OverviewComponent } from './app/pages/overview/overview.component';
import { DetailComponent } from './app/pages/detail/detail.component';
import { ProfileComponent } from './app/pages/profile/profile.component';
import { LandingComponent } from './app/pages/landing/landing.component';

export const appRoutes: Routes = [
    { path: 'landing', component: LandingComponent },
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: Dashboard },
            { path: 'overview', component: OverviewComponent },
            { path: 'detail', component: DetailComponent },
            { path: 'profile', component: ProfileComponent },
        ]
    },
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/service/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
