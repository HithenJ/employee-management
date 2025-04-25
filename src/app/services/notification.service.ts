import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:5000/api/employees';

  constructor(private afs: AngularFirestore, private http: HttpClient) {}

  // 🔔 Send leave approval/rejection notification to employee
  sendLeaveNotification(userId: string, fromDate: string, toDate: string, status: 'approved' | 'rejected') {
    const message = `Your leave has been ${status} from ${fromDate} to ${toDate}`;
    const notification = {
      message,
      timestamp: new Date(),
      status: 'unread',
      employeeId: userId
    };
    return this.afs.collection('notifications').add(notification);
  }

  // 🔍 Get notifications for a specific employee
  getNotifications(employeeId: string): Observable<any[]> {
    return this.afs.collection('notifications', ref =>
      ref.where('employeeId', '==', employeeId).orderBy('timestamp', 'desc')
    )
    .snapshotChanges()
    .pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // ✅ Mark a notification as read
  markAsRead(notificationId: string): Promise<void> {
    return this.afs.collection('notifications').doc(notificationId).update({ status: 'read' });
  }

  // ❌ Delete a specific notification
  deleteNotification(notificationId: string): Promise<void> {
    return this.afs.collection('notifications').doc(notificationId).delete();
  }

  // ✅ Mark all unread notifications for an employee as read
  markAllAsRead(employeeId: string): void {
    this.getNotifications(employeeId).subscribe(notifications => {
      notifications.forEach(notification => {
        if (notification.status === 'unread') {
          this.markAsRead(notification.id);
        }
      });
    });
  }

  // 🛠️ Log admin actions (like add/update/delete employee)
  logAdminAction(message: string) {
    const log = {
      message,
      timestamp: new Date(),
      status: 'unread',
      actor: 'Admin'
    };
    return this.afs.collection('notifications').add(log);
  }


  getAdminLogs(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:5000/api/admin-logs');
  }

  getUserLogs(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:5000/api/user-logs');
  }
  
}
