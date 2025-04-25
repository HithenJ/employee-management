import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AdminService } from 'src/app/services/admin.service';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

@Component({
  selector: 'app-setting',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingComponent implements OnInit {

  profileForm!: FormGroup;
  changePasswordForm!: FormGroup;
  appSettingsForm!: FormGroup;

  adminEmail: string = '';
  adminId!: number;
  profilePicUrl: string | null = null;

  passwordError: string = '';
  passwordSuccess: string = '';

  isProfileSectionVisible: boolean = false;  // To toggle visibility of Profile Information
  isPasswordSectionVisible: boolean = false;  // To toggle visibility of Change Password section
  isAppSettingsSectionVisible: boolean = false;  // To toggle visibility of Application Settings section

  appVersion: string = '1.0.0';  // Set a default app version
  maintenanceMode: boolean = false;  // Default to false, can toggle this setting
  enableRegistration: boolean = true;  // Default to true, enable registration
  systemLogs: string = '';  // Placeholder for system logs (you can fetch these from a service)

  darkMode: boolean = false;  // Default dark mode setting

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private afStorage: AngularFireStorage,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadAdminData();

    // Load dark mode preference from local storage if set
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode) {
      this.darkMode = JSON.parse(storedDarkMode);
      document.body.classList.toggle('dark-mode', this.darkMode); // Apply dark mode class to body
    }
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      adminName: ['', Validators.required],
      adminEmail: [{ value: '', disabled: true }, [Validators.required, Validators.email]]
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Initialize Application Settings form
    this.appSettingsForm = this.fb.group({
      maintenanceMode: [this.maintenanceMode],
      enableRegistration: [this.enableRegistration],
      darkMode: [this.darkMode] // Add darkMode to the form group
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  loadAdminData(): void {
    this.afAuth.currentUser.then(user => {
      if (user?.email) {
        this.adminEmail = user.email;

        this.adminService.getAdminByEmail(this.adminEmail).subscribe(employee => {
          if (employee) {
            this.adminId = employee.id;
            this.profilePicUrl = employee.profilePicUrl || null;
            this.profileForm.patchValue({
              adminName: employee.name,
              adminEmail: this.adminEmail
            });
          }
        });
      }
    });
  }

  onProfileSubmit(): void {
    if (this.profileForm.valid && this.adminId) {
      const updatedData = {
        name: this.profileForm.get('adminName')?.value,
        email: this.adminEmail
      };

      this.adminService.updateAdminProfile(this.adminId, updatedData).subscribe(() => {
        alert('Profile updated successfully!');
      });
    }
  }

  onFileChange(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadProfilePic(file);
    }
  }

  uploadProfilePic(file: File): void {
    const filePath = `profile_pics/${Date.now()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    task.snapshotChanges().toPromise().then(() => {
      fileRef.getDownloadURL().toPromise().then(downloadURL => {
        this.updateProfilePic(downloadURL);
      });
    });
  }

  updateProfilePic(downloadURL: string): void {
    if (this.adminId) {
      const updatedData = {
        profilePicUrl: downloadURL
      };

      this.adminService.updateAdminProfile(this.adminId, updatedData).subscribe(() => {
        this.profilePicUrl = downloadURL;
        alert('Profile picture updated successfully!');
      });
    }
  }

  onChangePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (this.changePasswordForm.invalid) {
      this.passwordError = 'Please fill all fields correctly.';
      return;
    }

    const currentPassword = this.changePasswordForm.get('currentPassword')?.value;
    const newPassword = this.changePasswordForm.get('newPassword')?.value;

    this.afAuth.currentUser.then(user => {
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        reauthenticateWithCredential(user, credential).then(() => {
          updatePassword(user, newPassword).then(() => {
            this.passwordSuccess = 'Password updated successfully!';
            this.changePasswordForm.reset();
          }).catch(error => {
            this.passwordError = 'Failed to update password: ' + error.message;
          });
        }).catch(() => {
          this.passwordError = 'Current password is incorrect.';
        });
      }
    });
  }

  onAppSettingsSubmit(): void {
    if (this.appSettingsForm.valid) {
      const settings = this.appSettingsForm.value;
      this.maintenanceMode = settings.maintenanceMode;
      this.enableRegistration = settings.enableRegistration;
      this.darkMode = settings.darkMode;

      // Apply dark mode setting
      document.body.classList.toggle('dark-mode', this.darkMode);

      // Store dark mode preference in local storage
      localStorage.setItem('darkMode', JSON.stringify(this.darkMode));

      // You can save this data to your backend service or perform any other action needed
      console.log('App Settings updated:', settings);
      alert('Application settings updated!');
    }
  }

  toggleProfileSection(): void {
    this.isProfileSectionVisible = !this.isProfileSectionVisible;
  }

  togglePasswordSection(): void {
    this.isPasswordSectionVisible = !this.isPasswordSectionVisible;
  }

  toggleAppSettingsSection(): void {
    this.isAppSettingsSectionVisible = !this.isAppSettingsSectionVisible;
  }

  toggleDarkMode(event: any): void {
    this.darkMode = event.target.checked;
    document.body.classList.toggle('dark-mode', this.darkMode);  // Apply dark mode class to body
    localStorage.setItem('darkMode', JSON.stringify(this.darkMode));  // Store dark mode preference in local storage
  }
}
