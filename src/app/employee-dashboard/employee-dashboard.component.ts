import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Ensure AngularFireAuth is correctly installed and imported
import { Router } from '@angular/router';
import { LeaveService } from '../services/leave.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
declare var bootstrap: any; // Ensure bootstrap is globally available or imported correctly
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  employeeId: number | null = null;
  employee: any = {};
  leaves: any[] = [];
  attendanceData: { date: string; status: string }[] = [];
  pendingLeaves = 0;
  notifications: { message: string; date: Date }[] = [];
  showModal = false;
  editProfileForm!: FormGroup;
  showLeaveForm = false;
  leaveReason = '';
  fromDate = '';
  toDate = '';
  recentMessage: string | null = null;
  showMonthlyAttendance = false;
  loading = true;
  today = '';
  todayAttendanceStatus = 'Not Available';
  showAttendanceModal = false;
  selectedSection: string = '';
  hasPersonalDetails: boolean = false;
  disabledDates: NgbDate[] = [];
  leaveCount: number = 0;
  isSidebarOpen: boolean = true;
  personalDetails: any = {
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: ''
  };

  editableName = false;
  profilePicPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  activeTab: 'profile' | 'attendance' | 'leave' | 'notifications' | 'settings' = 'profile';

  constructor(
    private employeeService: EmployeeService,
    // Removed unused attendanceService
    private afAuth: AngularFireAuth,
    private router: Router,
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.today = new Date().toISOString().split('T')[0];
  
    this.editProfileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['', Validators.required]
    });
  
    // Restore active tab from localStorage
    const storedTab = localStorage.getItem('activeEmployeeTab');
    if (storedTab && ['profile', 'attendance', 'leave', 'notifications'].includes(storedTab)) {
      this.activeTab = storedTab as any;
    }
  
    // Use session storage for user info
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
  
    if (!userData || userData.role !== 'employee') {
      this.router.navigate(['/login']);
      return;
    }
  
    const email = userData.email;
  
    this.employeeService.getByEmail(email).subscribe({
      next: data => {
        this.employee = data;
        this.employeeId = this.employee?.id;
  
        if (!this.employeeId) {
          console.error('Employee ID not found!');
          return;
        }
  
        // Format DOB
        if (this.employee?.dob) {
          this.employee.dob = new Date(this.employee.dob).toISOString().split('T')[0];
        }
  
        // Store personal details
        this.personalDetails = {
          ...this.employee,
          dob: this.employee.dob || ''
        };
  
        // ⚡ Start watching leave status for notifications immediately
        this.watchLeaveStatus();
  
        // Continue loading dashboard data
        this.initializeDashboard();
  
        // Load leave count (badge)
        this.leaveService.getLeaveHistory(this.employeeId).subscribe(leaveHistory => {
          this.leaveCount = leaveHistory?.length || 0;
        });
      },
      error: err => {
        console.error('Failed to load employee data', err);
        this.loading = false;
      }
    });
  }
  

  setActiveTab(tab: 'profile' | 'attendance' | 'leave' | 'notifications') {
    this.activeTab = tab;
    localStorage.setItem('activeEmployeeTab', tab);
  }

  initializeDashboard(): void {
    if (!this.employeeId) return;

    this.getTodayAttendanceStatus();
    this.getAttendanceHistory();
    this.getLeaveHistory();
    this.loadPendingLeaves();
    this.watchLeaveStatus();

    this.personalDetails = {
      name: this.employee.name || '',
      email: this.employee.email || '',
      phone: this.employee.phone || '',
      dob: this.formatDate(this.employee.dob),
      gender: this.employee.gender || '',
      address: this.employee.address || ''
    };

    this.profilePicPreview = this.employee?.profilePic || null;
    this.loading = false;
  }

  formatDate(date: string | Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  getTodayAttendanceStatus(): void {
    if (!this.employeeId) return;
    this.employeeService.getTodayAttendanceStatus(this.employeeId).subscribe({
      next: res => this.todayAttendanceStatus = res.status,
      error: () => this.todayAttendanceStatus = 'Not Available'
    });
  }

  getAttendanceHistory(): void {
    if (!this.employeeId) return;
    this.employeeService.getAttendanceHistory(this.employeeId).subscribe({
      next: data => this.attendanceData = data,
      error: err => console.error('Failed to load attendance history', err)
    });
  }

  toggleMonthlyAttendance(): void {
    this.showMonthlyAttendance = !this.showMonthlyAttendance;
  }

  watchLeaveStatus(): void {
    const leaveStatusInterval = setInterval(() => { // Store interval ID to clear it later if needed
      if (!this.employeeId) return;
      this.leaveService.getLeaveHistory(this.employeeId).subscribe((data: any[]) => { // Add type annotation for data
        const recent = data[0];
        if (recent && recent.status !== this.recentMessage) {
          const formattedFromDate = this.datePipe.transform(new Date(recent.fromDate), 'shortDate');
          const formattedToDate = this.datePipe.transform(new Date(recent.toDate), 'shortDate');

          const msg = recent.status === 'Approved'
            ? `🎉 Your leave from ${formattedFromDate} to ${formattedToDate} was Approved!`
            : recent.status === 'Rejected'
              ? `❌ Your leave from ${formattedFromDate} to ${formattedToDate} was Rejected.`
              : '';

          if (msg) {
            this.recentMessage = recent.status;
            this.addNotification(msg);
          }
        }
      });
    }, 1000);
  }

  getLeaveHistory(): void {
    if (!this.employeeId) return;
    this.leaveService.getLeaveHistory(this.employeeId).subscribe(data => {
      this.leaves = data;
    });
  }

  loadPendingLeaves(): void {
    if (!this.employeeId) return;
    this.leaveService.getPendingLeaves(this.employeeId).subscribe(leaves => {
      this.pendingLeaves = leaves.length;
    });
  }

  addNotification(message: string): void {
    this.notifications.unshift({ message, date: new Date() });
  }

  openLeaveForm(): void {
    this.showLeaveForm = true;
  }

  closeLeaveForm(): void {
    this.showLeaveForm = false;
  }

  submitLeaveRequest(): void {
    if (!this.leaveReason || !this.fromDate || !this.toDate || !this.employeeId || !this.employee.name) {
      alert('Please fill all fields!');
      return;
    }

    const leave = {
      employeeId: this.employeeId,
      name: this.employee.name,
      reason: this.leaveReason,
      fromDate: this.fromDate,
      toDate: this.toDate
    };

    this.leaveService.applyLeave(leave).subscribe({
      next: () => {
        this.addNotification('Your leave request has been submitted.');
        this.leaveReason = '';
        this.fromDate = '';
        this.toDate = '';
        this.showLeaveForm = false;
        this.loadPendingLeaves();
        this.getLeaveHistory();
      },
      error: () => alert('Failed to submit leave request.')
    });
  }

  openEditProfile(): void {
    this.editProfileForm.patchValue({
      name: this.employee.name || '',
      email: this.employee.email || '',
      department: this.employee.department || ''
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveProfile(): void {
    if (this.editProfileForm.invalid || !this.employeeId) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    const updatedData = this.editProfileForm.value;

    this.employeeService.updateProfile(this.employeeId, updatedData).subscribe({
      next: () => {
        this.employee = { ...this.employee, ...updatedData };
        this.closeModal();
        this.addNotification('✅ Profile updated successfully!');
      },
      error: err => {
        console.error('Profile update error', err);
        alert('❌ Failed to update profile. Please try again later.');
      }
    });
  }

  logout() {
    this.afAuth.signOut().then(() => {
      sessionStorage.removeItem('userData');
      this.router.navigate(['/login']);
    });
  }
  openLogoutModal() {
    // Ensure Bootstrap is loaded globally in your project
    const logoutModal = new (window as any).bootstrap.Modal(document.getElementById('logoutModal'));
    logoutModal.show();
  }
  confirmLogout() {
    sessionStorage.removeItem('userData'); 
    this.router.navigate(['/login']); // 
  }
  // confirmLogout(): void {
  //   this.afAuth.signOut().then(() => {
  //     this.router.navigate(['/login']);
  //     const modalElement = document.getElementById('logoutModal');
  //     const modal = bootstrap.Modal.getInstance(modalElement); // Ensure bootstrap.Modal is correctly initialized
  //     modal?.hide();
  //     sessionStorage.clear();
  //     localStorage.clear();
  //   }).catch(error => {
  //     console.error('Error logging out:', error);
  //   });
  // }

  showPersonalDetails(): void {
    this.personalDetails = {
      name: this.employee.name,
      email: this.employee.email,
      phone: this.employee.phone || '',
      dob: this.employee.dob || '',
      gender: this.employee.gender || '',
      address: this.employee.address || ''
    };
    this.openModalById('personalDetailsModal');
  }

  openModalById(id: string): void {
    const modalEl = document.getElementById(id);
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  openPersonalDetailsModal(): void {
    const modalElement = document.getElementById('personalDetailsModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      this.personalDetails = { ...this.employee };
      this.profilePicPreview = this.employee?.profilePic || null;
      modal.show();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.profilePicPreview = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  savePersonalDetails(): void {
    if (!this.employeeId) return;

    let dob = this.personalDetails.dob;
    if (dob instanceof Date) {
      dob = dob.toISOString().split('T')[0];
    }

    const updatedDetails = {
      ...this.personalDetails,
      dob,
      profilePic: this.profilePicPreview
    };

    this.employeeService.updateEmployee(this.employeeId, updatedDetails).subscribe({
      next: () => {
        this.employee = { ...updatedDetails, id: this.employeeId };
        const outsideButton = document.getElementById('editPersonalDetailsBtn');
        if (outsideButton) outsideButton.focus();
        else (document.activeElement as HTMLElement)?.blur();

        const modalElement = document.getElementById('personalDetailsModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      },
      error: err => {
        console.error('Error updating profile', err);
      }
    });
  }
  isDateDisabled = (date: NgbDate) => { 
    return this.disabledDates.some(disabledDate => 
      disabledDate.year === date.year && 
      disabledDate.month === date.month && 
      disabledDate.day === date.day
    );
  }
}
