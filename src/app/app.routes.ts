import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './features/dashboard/dashboard';
import { LayoutComponent } from './shared/layout/layout';
import { AuthGuard } from './guards/auth-guard';
import { PropertyInspectionFormComponent } from './features/property-inspection-form/property-inspection-form';
import { PropertyListComponent } from './features/property-list/property-list';
import { UserComponent } from './main/user/user';
import { RoleComponent } from './main/role/role';
 
export const routes: Routes = [

{
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'property-inspection', component: PropertyInspectionFormComponent },
      { path: 'property-inspection/edit/:id', component: PropertyInspectionFormComponent },
      { path: 'property-list', component: PropertyListComponent },
      { path: 'user', component: UserComponent },
      { path: 'role', component: RoleComponent },
    ]
  },

// routes WITHOUT sidebar (login, auth)
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent }
];
  