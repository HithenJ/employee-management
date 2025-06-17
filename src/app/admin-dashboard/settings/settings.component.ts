import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AdminService } from 'src/app/services/admin.service';
import { EmailAuthProvider } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class AdminSettingsComponent implements OnInit, OnDestroy {

  profileForm!: FormGroup;
  changePasswordForm!: FormGroup;
  appSettingsForm!: FormGroup;

  adminEmail: string = '';
  adminId!: number;
  profilePicUrl: string | null = null;
  isProfilePicSelected: boolean = false;
  isProfilePicSaving: boolean = false;
  profilePicSaveError: string = '';
  profilePicSaveSuccess: string = '';
  adminSubscription?: Subscription;
  passwordError: string = '';
  passwordSuccess: string = '';

  isProfileSectionVisible: boolean = false;
  isPasswordSectionVisible: boolean = false;
  isAppSettingsSectionVisible: boolean = false;

  appVersion: string = '1.0.0';
  darkMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private afStorage: AngularFireStorage,
    private adminService: AdminService,
    private http: HttpClient
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadAdminData();
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode) {
      this.darkMode = JSON.parse(storedDarkMode);
      document.body.classList.toggle('dark-mode', this.darkMode);
    }
  }

  ngOnDestroy(): void {
    this.adminSubscription?.unsubscribe();
  }

  initializeForms(): void {
this.profileForm = this.fb.group({
  adminName: ['', Validators.required],
  adminEmail: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
  adminPhone: [{ value: '', disabled: true }]
});


    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.appSettingsForm = this.fb.group({
      darkMode: [this.darkMode]
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  loadAdminData(): void {
    this.adminSubscription = this.afAuth.authState.pipe(take(1)).subscribe(user => {
      if (user?.email) {
        this.adminEmail = user.email;
        this.profileForm.patchValue({ adminEmail: this.adminEmail });

   this.adminService.getAdminByEmail(this.adminEmail).subscribe({
  next: (admin) => {
    if (admin) {
      this.adminId = admin.id;
      this.profilePicUrl = admin.profilePic?.startsWith('data:')
        ? admin.profilePic
        : `data:image/jpeg;base64,${admin.profilePic}`;

      this.profileForm.patchValue({
        adminName: admin.name,
        adminPhone: admin.phone 
      });
    }
  },

          error: (error) => {
            console.error('Error loading admin data:', error);
            this.profilePicUrl = null;
          }
        });
      }
    });
    }
  

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const base64String = e.target?.result as string;
        this.profilePicUrl = base64String;
        this.isProfilePicSelected = true;
        this.isProfilePicSaving = false;
        this.profilePicSaveError = '';
        this.profilePicSaveSuccess = '';

        // Update admin data in sessionStorage with new profile pic
        const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}');
        sessionStorage.setItem('adminData', JSON.stringify({
          ...adminData,
          profilePic: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfilePicture(): void {
    if (!this.adminId || !this.profilePicUrl) {
      this.profilePicSaveError = 'Please select a profile picture first';
      setTimeout(() => {
        this.profilePicSaveError = '';
      }, 3000);
      return;
    }

    this.isProfilePicSaving = true;
    try {
      const base64String = this.profilePicUrl.split(',')[1];
      const formData = {
        profilePic: base64String,
        name: this.profileForm.get('adminName')?.value,
        email: this.profileForm.get('adminEmail')?.value
      };

      this.adminService.updateAdminProfile(this.adminId, formData).subscribe({
        next: () => {
          this.profilePicSaveSuccess = 'Profile picture uploaded successfully!';
          this.isProfilePicSaving = false;
          setTimeout(() => {
            this.profilePicSaveSuccess = '';
          }, 3000);


        },
        error: (error) => {
          this.profilePicSaveError = 'Error updating profile picture: ' + (error.message || 'Unknown error');
          this.isProfilePicSaving = false;
          setTimeout(() => {
            this.profilePicSaveError = '';
          }, 3000);
        }
      });
    } catch (error) {
      this.isProfilePicSaving = false;
      this.profilePicSaveError = 'Error processing image: ' + (error instanceof Error ? error.message : 'Unknown error');
      setTimeout(() => {
        this.profilePicSaveError = '';
      }, 3000);
    }


    try {
      const base64String = this.profilePicUrl.split(',')[1];
      const formData = {
        profilePic: base64String,
        name: this.profileForm.get('adminName')?.value,
        email: this.adminEmail
      };

      this.adminService.updateAdminProfile(this.adminId, formData).subscribe({
        next: () => {
          this.isProfilePicSaving = false;
          this.profilePicSaveSuccess = 'Profile picture updated successfully!';
          this.isProfilePicSelected = false;
          setTimeout(() => {
            this.profilePicSaveSuccess = '';
          }, 3000);
        },
        error: (err) => {
          this.isProfilePicSaving = false;
          this.profilePicSaveError = 'Error updating profile picture: ' + (err.error?.message || 'Unknown error');
          setTimeout(() => {
            this.profilePicSaveError = '';
          }, 3000);
        }
      });
    } catch (error: unknown) {
      this.isProfilePicSaving = false;
      this.profilePicSaveError = 'Error processing image: ' + (error instanceof Error ? error.message : 'Unknown error');
      setTimeout(() => {
        this.profilePicSaveError = '';
      }, 3000);
    }
  }

  onProfileSubmit(): void {
    if (!this.profileForm.valid || !this.adminId) return;

    const updatedData = {
      name: this.profileForm.get('adminName')?.value,
      email: this.adminEmail
    };

    this.adminService.updateAdminProfile(this.adminId, updatedData).subscribe({
      next: () => {
        this.passwordSuccess = 'Profile updated successfully!';
        setTimeout(() => {
          this.passwordSuccess = '';
        }, 3000);
      },
      error: () => {
        this.passwordError = 'Error updating profile';
        setTimeout(() => {
          this.passwordError = '';
        }, 3000);
      }
    });
  }

  onChangePassword(): void {
    if (!this.changePasswordForm.valid || !this.adminId) return;

    const currentPassword = this.changePasswordForm.get('currentPassword')?.value;
    const newPassword = this.changePasswordForm.get('newPassword')?.value;

    this.afAuth.authState.pipe(take(1)).subscribe(user => {
      if (user) {
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        user.reauthenticateWithCredential(credential).then(() => {
          user.updatePassword(newPassword).then(() => {
            this.passwordSuccess = 'Password updated successfully!';
            setTimeout(() => {
              this.passwordSuccess = '';
              this.changePasswordForm.reset();
            }, 3000);
          }).catch(() => {
            this.passwordError = 'Error updating password';
            setTimeout(() => {
              this.passwordError = '';
            }, 3000);
          });
        }).catch(() => {
          this.passwordError = 'Invalid current password';
          setTimeout(() => {
            this.passwordError = '';
          }, 3000);
        });
      }
    });
  }

  onAppSettingsSubmit(): void {
    if (!this.appSettingsForm.valid) return;

    const settings = this.appSettingsForm.value;

    this.passwordSuccess = 'Settings updated successfully!';
    setTimeout(() => {
      this.passwordSuccess = '';
    }, 3000);
  }



}
