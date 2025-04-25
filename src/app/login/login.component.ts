import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoggingIn = false;
  showPassword = false;
  isAdminLogin = false;

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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  ngOnInit() {
    const adminData = sessionStorage.getItem('adminData');
    const employeeData = sessionStorage.getItem('employeeData');

    if (adminData && this.router.url !== '/admin-dashboard') {
      this.router.navigate(['/admin-dashboard']);
    } else if (employeeData && this.router.url !== '/employee-dashboard') {
      this.router.navigate(['/employee-dashboard']);
    }
  }

  toggleLoginRole() {
    this.isAdminLogin = !this.isAdminLogin;
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.isLoggingIn = true;

    const { email, password } = this.loginForm.value;

    this.afAuth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        const loggedInEmail = result.user?.email;

        // Fetch user data from your backend
        this.http.get<any>(`http://localhost:5000/api/employees/email/${loggedInEmail}`).subscribe({
          next: (res) => {
            const userData = {
              email: res.email,
              name: res.name,
              role: res.role
            };
        
            // Store based on role
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
            alert('Something went wrong while fetching user info');
          }
        });
        
      })
      .catch(err => {
        alert('Invalid login: ' + err.message);
      });
  }
}
