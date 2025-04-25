import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  logActivity(uid: string, type: string, device: string): void {
    const log = {
      type,
      device,
      timestamp: new Date()
    };
    this.afs.collection(`users/${uid}/activityLogs`).add(log);
  }

  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password).then(cred => {
      if (cred.user) {
        this.logActivity(cred.user.uid, 'login', 'Web');
      }
      return cred;
    });
  }
  getCurrentuser(){
    JSON.parse(localStorage.getItem('currentUser') || '()')
  }
}
