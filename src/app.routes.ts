import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { authGuard, adminGuard } from './app/service/auth/guard';

export const appRoutes: Routes = [
    { path: 'landing', loadComponent: () => import('./app/pages/landing/landing.component').then(m => m.LandingComponent) },
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', loadComponent: () => import('./app/pages/dashboard/dashboard').then(m => m.Dashboard) },
            { path: 'overview', loadComponent: () => import('./app/pages/overview/overview.component').then(m => m.OverviewComponent) },
            { path: 'backlog', loadComponent: () => import('./app/pages/backlog/backlog.component').then(m => m.BacklogComponent) },
            { path: 'detail', loadComponent: () => import('./app/pages/detail/detail.component').then(m => m.DetailComponent) },
            { path: 'profile', loadComponent: () => import('./app/pages/profile/profile.component').then(m => m.ProfileComponent) },
            { path: 'admin', loadComponent: () => import('./app/pages/admin/admin.component').then(m => m.AdminComponent), canActivate: [adminGuard] },
        ]
    },
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    { path: 'notfound', loadComponent: () => import('./app/pages/notfound/notfound').then(m => m.Notfound) },
    { path: 'auth', loadChildren: () => import('./app/service/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
