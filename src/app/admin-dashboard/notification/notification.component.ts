import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  adminLogs: any[] = [];
  userLogs: any[] = [];
  isLoading = true;
  selectedTab: 'admin' | 'user' = 'admin';
  employeeId: string = 'EMP001'; // should be set dynamically

  constructor(
    private notificationService: NotificationService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    // Admin logs from DB
    this.notificationService.getAdminLogs().subscribe({
      next: (logs: any[]) => {
        this.adminLogs = logs;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading admin logs', err);
        this.isLoading = false;
      }
    });

    // Simulated Firebase login/logout history (mock or Firestore based)
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userLogs.push({
          action: 'Login',
          user: user.email,
          timestamp: new Date()
        });
      } else {
        this.userLogs.push({
          action: 'Logout',
          user: 'Anonymous',
          timestamp: new Date()
        });
      }
    });

    // You can also fetch other user logs from database here if needed
  }
}
