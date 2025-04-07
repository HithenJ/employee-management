import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getNotifications();
  }

  getNotifications() {
    this.http.get<any[]>('/api/admin/notifications').subscribe(data => {
      this.notifications = data;
    });
  }

  approveLeave(id: number) {
    this.http.post(`/api/leave/${id}/approve`, {}).subscribe(() => {
      alert('Leave Approved');
      this.getNotifications();
    });
  }

  rejectLeave(id: number) {
    this.http.post(`/api/leave/${id}/reject`, {}).subscribe(() => {
      alert('Leave Rejected');
      this.getNotifications();
    });
  }
}
