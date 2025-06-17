import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // ✅ Firestore
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Component({
  selector: 'app-employee-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class EmployeeSettingsComponent implements OnInit {
  activeTab: string = 'profile';
  notifications: { message: string; date: Date }[] = [];

  settingsForm: FormGroup | any;
  isChangePasswordVisible: boolean = false;
  appVersion: string = '1.0.3';
  lastUpdated: string = '18 Apr 2025';

  userMetadata: any = {};
  showActivityLog: boolean = false;
  showPasswordChangeLog: boolean = false;

  passwordChangeLog: { timestamp: string; message: string; changeReason?: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore 
  ) {}

  ngOnInit(): void {
    this.addNotification('Welcome to the Settings page!');
    this.initializeForm();
    this.fetchUserMetadata();
    this.loadPasswordLogs(); 

  }

  initializeForm(): void {
    this.settingsForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required]
    });
  }

  toggleChangePassword(): void {
    this.isChangePasswordVisible = !this.isChangePasswordVisible;
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) return;

    const { currentPassword, newPassword, confirmNewPassword } = this.settingsForm.value;

    if (newPassword !== confirmNewPassword) {
      alert('New password and confirmation do not match!');
      return;
    }

    this.changePassword(currentPassword, newPassword);
  }

  changePassword(currentPassword: string, newPassword: string): void {
    this.afAuth.currentUser.then(user => {
      if (user) {
        const credential = firebase.auth.EmailAuthProvider.credential(user.email!, currentPassword);

        user.reauthenticateWithCredential(credential)
          .then(() => {
            user.updatePassword(newPassword)
              .then(() => {
                const timestamp = new Date().toLocaleString();
                const logEntry = {
                  uid: user.uid,
                  timestamp,
                  message: 'Password changed successfully',
                  changeReason: 'User-initiated password change'
                };

                // ✅ Save to Firestore collection
                this.firestore.collection('passwordLogs').add(logEntry)
                  .then(() => console.log('Password log added to Firestore'))
                  .catch(err => console.error('Error writing password log:', err));

                // ✅ Save locally too (optional)
                this.passwordChangeLog.unshift({
                  timestamp,
                  message: logEntry.message,
                  changeReason: logEntry.changeReason
                });

                alert('Password changed successfully!');
                this.settingsForm.reset();
                this.isChangePasswordVisible = false;
              })
              .catch(error => {
                console.error('Error updating password', error);
                alert('Error updating password');
              });
          })
          .catch(error => {
            console.error('Reauthentication failed', error);
            alert('Current password is incorrect!');
          });
      }
    });
  }

  fetchUserMetadata(): void {
    this.afAuth.currentUser.then(user => {
      if (user) {
        this.userMetadata = {
          lastSignInTime: user.metadata.lastSignInTime,
          creationTime: user.metadata.creationTime,
        };
      } else {
        console.log('No user is authenticated.');
      }
    });
  }

  addNotification(message: string): void {
    this.notifications.unshift({ message, date: new Date() });
  }

  clearNotifications(): void {
    this.notifications = [];
  }

  toggleActivityLog(): void {
    this.showActivityLog = !this.showActivityLog;
  }

  togglePasswordChangeLog(): void {
    this.showPasswordChangeLog = !this.showPasswordChangeLog;
  }
  loadPasswordLogs(): void {
    this.afAuth.currentUser.then(user => {
      if (user) {
        this.firestore.collection('passwordLogs', ref =>
          ref.where('uid', '==', user.uid).orderBy('timestamp', 'desc')
        )
        .valueChanges()
        .subscribe((logs: any) => {
          this.passwordChangeLog = logs.map((log: any) => ({
            timestamp: log.timestamp,
            message: log.message,
            changeReason: log.changeReason || ''
          }));
        });
      }
    });
  }
  

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
