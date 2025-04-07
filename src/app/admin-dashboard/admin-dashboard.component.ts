import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  showForm = false;

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  showAddForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  refreshList() {
    // We'll later trigger refresh for the list here after form submission
    this.showForm = false;
  }
}
