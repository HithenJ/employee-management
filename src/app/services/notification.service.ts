// /src/app/services/notification.service.ts

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private afs: AngularFirestore) {}

  sendLeaveNotification(userId: string, fromDate: string, toDate: string, status: 'approved' | 'rejected') {
    const message = `Your leave has been ${status} from ${fromDate} to ${toDate}`;
    const notification = {
      message: message,
      date: new Date().toISOString(),
      status: 'unread'
    };

    return this.afs.collection(`users/${userId}/notifications`).add(notification);
  }
  getNotifications(employeeId: string): Observable<any[]> {
    return this.afs.collection('notifications', ref => 
      ref.where('employeeId', '==', employeeId).orderBy('timestamp', 'desc')
    ).valueChanges();
  }
  
}
