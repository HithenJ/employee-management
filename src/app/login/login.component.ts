  import { Component } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { AngularFireAuth } from '@angular/fire/compat/auth';
  import { Router } from '@angular/router';

  @Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
  })
  export class LoginComponent {
    loginForm: FormGroup;

    constructor(
      private fb: FormBuilder,
      private afAuth: AngularFireAuth,
      private router: Router
    ) {
      this.loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      });
    }

    onLogin() {
      const { email, password } = this.loginForm.value;
      this.afAuth.signInWithEmailAndPassword(email, password)
        .then((res) => {
          // Example: Redirect based on user role
          if (email.includes('admin')) {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/employee-dashboard']);
          }
        })
        .catch((err) => {
          alert('Login Failed: ' + err.message);
        });
    }
  }
