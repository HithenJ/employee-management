import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-notifications',
  templateUrl: './notification.component.html',
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  loading: boolean = true;
  employeeId: string = ''; // Populate this from auth or session

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Example: you might get employeeId from auth or session storage
    this.employeeId = localStorage.getItem('employeeId') || '';

    if (this.employeeId) {
      this.notificationService.getNotifications(this.employeeId).subscribe(data => {
        this.notifications = data;
        this.loading = false;
      });
    } else {
      console.error('No employeeId found');
      this.loading = false;
    }
  }
}
