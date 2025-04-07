import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { EmployeeListComponent } from './admin-dashboard/employee-list/employee-list.component';
import { EmployeeFormComponent } from './admin-dashboard/employee-form/employee-form.component';
import { AttendanceComponent } from './admin-dashboard/attendance/attendance.component';
import { LeaveComponent } from './admin-dashboard/leave/leave.component';
import { NotificationComponent } from './admin-dashboard/notification/notification.component';
import { ProfileComponent } from './employee-dashboard/profile.component';
import { LeavesComponent } from './employee-dashboard/leave.component';

const routes: Routes = [
 { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin-dashboard', component: AdminDashboardComponent, 
    children: [
      { path: '', redirectTo: 'employees', pathMatch: 'full' },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'employee-form', component: EmployeeFormComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'leave', component: LeaveComponent },
      { path: 'notifications', component: NotificationComponent }
    ]
  },  {
    path: 'employee-dashboard', component: EmployeeDashboardComponent, children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'leaves', component: LeavesComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
  },  
  
  { path: 'employee-dashboard/:id', component: EmployeeDashboardComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
