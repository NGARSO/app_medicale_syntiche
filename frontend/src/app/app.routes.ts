import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./modules/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./modules/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./modules/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./modules/patients/patient-list/patient-list.component').then(m => m.PatientListComponent)
      },
      {
        path: 'patients/new',
        loadComponent: () =>
          import('./modules/patients/patient-form/patient-form.component').then(m => m.PatientFormComponent)
      },
      {
        path: 'patients/:id/edit',
        loadComponent: () =>
          import('./modules/patients/patient-form/patient-form.component').then(m => m.PatientFormComponent)
      },
      {
        path: 'medecins',
        loadComponent: () =>
          import('./modules/medecins/medecin-list/medecin-list.component').then(m => m.MedecinListComponent)
      },
      {
        path: 'medecins/new',
        loadComponent: () =>
          import('./modules/medecins/medecin-form/medecin-form.component').then(m => m.MedecinFormComponent)
      },
      {
        path: 'medecins/:id/edit',
        loadComponent: () =>
          import('./modules/medecins/medecin-form/medecin-form.component').then(m => m.MedecinFormComponent)
      },
      {
        path: 'medecins/:id/calendar',
        loadComponent: () =>
          import('./modules/medecins/medecin-calendar/medecin-calendar.component').then(m => m.MedecinCalendarComponent)
      },
      {
        path: 'planning',
        loadComponent: () =>
          import('./modules/planning/planning-calendar/planning-calendar.component').then(m => m.PlanningCalendarComponent)
      },
      {
        path: 'planning/calendar',
        loadComponent: () =>
          import('./modules/planning/planning-calendar/planning-calendar.component').then(m => m.PlanningCalendarComponent)
      },
      {
        path: 'rendez-vous',
        loadComponent: () =>
          import('./modules/rendez-vous/rdv-list/rdv-list.component').then(m => m.RdvListComponent)
      },
      {
        path: 'rendez-vous/new',
        loadComponent: () =>
          import('./modules/rendez-vous/rdv-form/rdv-form.component').then(m => m.RdvFormComponent)
      },
      {
        path: 'rendez-vous/:id/edit',
        loadComponent: () =>
          import('./modules/rendez-vous/rdv-form/rdv-form.component').then(m => m.RdvFormComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./modules/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./modules/users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'users/new',
        loadComponent: () =>
          import('./modules/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'users/:id/edit',
        loadComponent: () =>
          import('./modules/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'consultations',
        loadComponent: () =>
          import('./modules/consultations/consultation-list/consultation-list.component').then(m => m.ConsultationListComponent)
      },
      {
        path: 'consultations/new',
        loadComponent: () =>
          import('./modules/consultations/consultation-form/consultation-form.component').then(m => m.ConsultationFormComponent)
      },
      {
        path: 'consultations/:id',
        loadComponent: () =>
          import('./modules/consultations/consultation-detail/consultation-detail.component').then(m => m.ConsultationDetailComponent)
      },
      {
        path: 'ordonnances',
        loadComponent: () =>
          import('./modules/ordonnances/ordonnance-list/ordonnance-list.component').then(m => m.OrdonnanceListComponent)
      },
      {
        path: 'ordonnances/:id/view',
        loadComponent: () =>
          import('./modules/ordonnances/ordonnance-detail/ordonnance-detail.component').then(m => m.OrdonnanceDetailComponent)
      },
      {
        path: 'verify/:code',
        loadComponent: () =>
          import('./modules/verification/prescription-verify/prescription-verify.component').then(m => m.PrescriptionVerifyComponent)
      },
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];
