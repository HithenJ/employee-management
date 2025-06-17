import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoggingIn = false;
  showPassword = false;
  isAdminLogin = false;
  loginError = '';
  isOnline = navigator.onLine;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    // Auto redirect if already logged in
    const adminData = sessionStorage.getItem('adminData');
    const employeeData = sessionStorage.getItem('userData');

    if (adminData && this.router.url !== '/admin-dashboard') {
      this.router.navigate(['/admin-dashboard']);
    } else if (employeeData && this.router.url !== '/employee-dashboard') {
      this.router.navigate(['/employee-dashboard']);
    }

    // Listen to internet connection changes
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  }

  ngOnDestroy() {
    // Remove event listeners on component destroy
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  }

  updateOnlineStatus = () => {
    this.isOnline = navigator.onLine;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleLoginRole() {
    this.isAdminLogin = !this.isAdminLogin;
  }

  onLogin() {
    this.loginError = '';

    if (this.loginForm.invalid) return;

    if (!navigator.onLine) {
      this.loginError = 'No Internet Connection. Please connect and try again.';
      return;
    }

    this.isLoggingIn = true;
    const { email, password } = this.loginForm.value;

    this.afAuth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        const loggedInEmail = result.user?.email;

        this.http.get<any>(`http://localhost:5000/api/employees/email/${loggedInEmail}`).subscribe({
          next: (res) => {
            const userData = {
              email: res.email,
              name: res.name,
              role: res.role
            };

            if (res.role === 'admin') {
              sessionStorage.setItem('adminData', JSON.stringify(userData));
              this.router.navigate(['/admin-dashboard']);
            } else if (res.role === 'employee') {
              sessionStorage.setItem('userData', JSON.stringify(userData));
              this.router.navigate(['/employee-dashboard']);
            }
          },
          error: (err) => {
            console.error('Error fetching user data:', err);
            this.loginError = 'Could not fetch user details. Try again later.';
          }
        });
      })
      .catch(err => {
        this.loginError = 'Login failed: ' + err.message;
      })
      .finally(() => {
        this.isLoggingIn = false;
      });
  }
}
