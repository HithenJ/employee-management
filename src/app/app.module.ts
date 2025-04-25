  import { NgModule } from '@angular/core';
  import { BrowserModule } from '@angular/platform-browser';
  import { ReactiveFormsModule, FormsModule } from '@angular/forms';
  import { AppRoutingModule } from './app-routing.module';
  import { AppComponent } from './app.component';
  import { LoginComponent } from './login/login.component';
  import { AngularFireModule } from '@angular/fire/compat';
  import { AngularFireAuthModule } from '@angular/fire/compat/auth';
  import { HttpClientModule } from '@angular/common/http';
  import { CommonModule } from '@angular/common';
  import { RouterModule } from '@angular/router';
  import { ToastrModule } from 'ngx-toastr';
  import { NoopAnimationsModule } from '@angular/platform-browser/animations';
  import { DatePipe } from '@angular/common';
  // Dashboard & Admin
  import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
  import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
  import { EmployeeFormComponent } from './admin-dashboard/employee-form/employee-form.component';
  import { EmployeeListComponent } from './admin-dashboard/employee-list/employee-list.component';
  import { LeaveComponent } from './admin-dashboard/leave/leave.component';
  import { NotificationComponent } from './admin-dashboard/notification/notification.component';
  import { AttendanceComponent } from './admin-dashboard/attendance/attendance.component';

  // Employee-side components
  import { ProfileComponent } from './employee-dashboard/profile.component';
  import { LeavesComponent } from './employee-dashboard/leave.component';
  import { NotificationsComponent } from './employee-dashboard/notification.component';
  import { AttendanceEComponent } from './employee-dashboard/attendance.component';
  // Services
  import { AuthService } from './services/auth.service';
import{AdminService} from './services/admin.service'
  // Environment
  import { environment } from 'src/environments/environment';
import { NavbarComponent } from './employee-dashboard/navbar/navbar.component';
import { SidebarComponent } from './employee-dashboard/sidebar/sidebar.component';
import { SettingsComponent } from './employee-dashboard/settings/settings.component';
import { EmailAuthProvider } from 'firebase/auth'; 
import{SettingComponent} from './admin-dashboard/settings/settings.component';
import { MaterialModule } from './material.module';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
  @NgModule({
    declarations: [
      AppComponent,
      LoginComponent,
      AdminDashboardComponent,
      EmployeeDashboardComponent,
      EmployeeFormComponent,
      EmployeeListComponent,
      NotificationComponent,
      AttendanceComponent,
      ProfileComponent,
      LeavesComponent,
      LeaveComponent,
      NotificationsComponent,
      AttendanceEComponent,
      NavbarComponent,
      SidebarComponent,
      SettingsComponent,
      SettingComponent
    ],
    imports: [
      BrowserModule,
      AppRoutingModule,
      ReactiveFormsModule,
      FormsModule,
      HttpClientModule,
   
      CommonModule,
      RouterModule,
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireAuthModule, 
      NoopAnimationsModule,
 MaterialModule ,
 NgbDatepickerModule,

      
      
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-bottom-right',
        preventDuplicates: true,
      }),

    ],
    providers: [AuthService,DatePipe ],
    bootstrap: [AppComponent]
  })
  export class AppModule { }
