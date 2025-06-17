import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { NgbModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../environments/environment';

// Dashboard & Admin Components
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { EmployeeFormComponent } from './admin-dashboard/employee-form/employee-form.component';
import { EmployeeListComponent } from './admin-dashboard/employee-list/employee-list.component';
import { LeaveComponent } from './admin-dashboard/leave/leave.component';
import { NotificationComponent } from './admin-dashboard/notification/notification.component';
import { AttendanceComponent } from './admin-dashboard/attendance/attendance.component';
import { AdminSettingsComponent } from './admin-dashboard/settings/settings.component';
import { EmployeeSettingsComponent } from './employee-dashboard/settings/settings.component';

// Employee Components
import { ProfileComponent } from './employee-dashboard/profile.component';
import { LeavesComponent } from './employee-dashboard/leave.component';
import { NotificationsComponent } from './employee-dashboard/notification.component';
import { AttendanceEComponent } from './employee-dashboard/attendance.component';

// Services
import { AuthService } from './services/auth.service';
import { AdminService } from './services/admin.service';

// UI Components
import { NavbarComponent } from './employee-dashboard/navbar/navbar.component';
import { SidebarComponent } from './employee-dashboard/sidebar/sidebar.component';

// Material & Common Modules
import { MaterialModule } from './material.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminDashboardComponent,
    EmployeeDashboardComponent,
    EmployeeFormComponent,
    EmployeeListComponent,
    LeaveComponent,
    NotificationComponent,
    AttendanceComponent,
    ProfileComponent,
    LeavesComponent,
    NotificationsComponent,
    AttendanceEComponent,
    NavbarComponent,
    SidebarComponent,
    AdminSettingsComponent,
    EmployeeSettingsComponent,
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
    MaterialModule,
    NgbModule,
    NgbDatepickerModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
  ],
  providers: [
    AuthService,
    AdminService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
