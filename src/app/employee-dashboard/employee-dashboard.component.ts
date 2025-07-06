import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { LeaveService } from '../services/leave.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
declare var bootstrap: any; // Ensure bootstrap is globally available

interface Employee {
  id: number;
  name: string;
  email: string;
  department?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  profilePic?: string | ArrayBuffer | null;
}

interface Leave {
  id?: number;
  employeeId: number;
  name: string;
  reason: string;
  fromDate: string;
  toDate: string;
  status?: string;
}

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css'],
  providers: [DatePipe]
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  employeeId: number | null = null;
  employee: Employee = {} as Employee;
  leaves: Leave[] = [];
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
  unreadNotificationCount = 0;
  unreadLeaveCount = 0;
profilePicPreview: string | ArrayBuffer | null = null;
selectedFileName: string = '';
  selectedSection = '';
  hasPersonalDetails = false;
  disabledDates: NgbDate[] = [];
  leaveCount = 0;
  isSidebarOpen = true;
  personalDetails: any = {
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: ''
  };

  editableName = false;
  selectedFile: File | null = null;
  activeTab: 'profile' | 'attendance' | 'leave' | 'notifications' | 'settings' = 'profile';

  private leaveStatusIntervalId: any;

  constructor(
    private employeeService: EmployeeService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private route: ActivatedRoute,
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

  // ✅ Use session storage for user info
  const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

  if (!userData || userData.role !== 'employee') {
    this.router.navigate(['/login']);
    return;
  }

  const email = userData.email;

  // ✅ Handle tab from URL or localStorage
  const validTabs = ['profile', 'attendance', 'leave', 'notifications', 'settings'];

  this.route.paramMap.subscribe(params => {
    const section = params.get('section');
    if (section && validTabs.includes(section)) {
      this.activeTab = section as any;
      localStorage.setItem('activeEmployeeTab', section);
    } else {
      const storedTab = localStorage.getItem('activeEmployeeTab');
      this.activeTab = validTabs.includes(storedTab || '') ? (storedTab as any) : 'profile';
    }
  });

  // ✅ Restore unread badge counts from localStorage
  const storedUnreadNotificationCount = localStorage.getItem('unreadNotificationCount');
  const storedUnreadLeaveCount = localStorage.getItem('unreadLeaveCount');
  this.unreadNotificationCount = storedUnreadNotificationCount ? +storedUnreadNotificationCount : 0;
  this.unreadLeaveCount = storedUnreadLeaveCount ? +storedUnreadLeaveCount : 0;

  // ✅ Fetch employee data
  this.employeeService.getByEmail(email).subscribe({
    next: data => {
      this.employee = data;
      this.employeeId = this.employee?.id;

      if (!this.employeeId) {
        console.error('Employee ID not found!');
        return;
      }

      if (this.employee?.dob) {
        this.employee.dob = this.formatDate(this.employee.dob);
      }

      this.personalDetails = {
        ...this.employee,
        dob: this.employee.dob || ''
      };

      this.watchLeaveStatus();
      this.initializeDashboard();

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




  ngOnDestroy(): void {
    if (this.leaveStatusIntervalId) {
      clearInterval(this.leaveStatusIntervalId);
    }
  }
  onTabChange(tab: string): void {
  this.activeTab = tab as 'profile' | 'attendance' | 'leave' | 'notifications' | 'settings';
  localStorage.setItem('activeEmployeeTab', tab);  // persist tab
}

setActiveTab(tab: 'profile' | 'attendance' | 'leave' | 'notifications' | 'settings') {
  this.activeTab = tab;
  localStorage.setItem('activeEmployeeTab', tab);
  this.router.navigate(['/employee-dashboard', tab]);
}



  initializeDashboard(): void {
    if (!this.employeeId) return;

    this.getTodayAttendanceStatus();
    this.getAttendanceHistory();
    this.getLeaveHistory();
    this.loadPendingLeaves();

this.personalDetails = {
  name: this.employee.name || '',
  email: this.employee.email || '',
  phone: this.employee.phone || '',
  dob: this.employee.dob ? this.formatDate(this.employee.dob) : '',
  gender: this.employee.gender || '',
  address: this.employee.address || ''
};


    this.profilePicPreview = this.employee?.profilePic || null;
    this.loading = false;
  }

  formatDate(date: string | Date | null): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }
goToTab(tabName: string) {
  this.activeTab = tabName as 'profile' | 'attendance' | 'leave' | 'notifications' | 'settings';
  this.router.navigate(['/employee-dashboard', tabName]);
  localStorage.setItem('activeEmployeeTab', tabName);
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
  if (this.leaveStatusIntervalId) {
    clearInterval(this.leaveStatusIntervalId);
  }

  const seenLeaveIds = JSON.parse(localStorage.getItem('seenLeaveIds') || '[]');

  this.leaveStatusIntervalId = setInterval(() => {
    if (!this.employeeId) return;

    this.leaveService.getLeaveHistory(this.employeeId).subscribe((data: Leave[]) => {
      if (!data || data.length === 0) return;

      const newLeaves = data.filter(leave => !seenLeaveIds.includes(leave.id));

      newLeaves.forEach(recent => {
        const formattedFromDate = this.datePipe.transform(new Date(recent.fromDate), 'shortDate');
        const formattedToDate = this.datePipe.transform(new Date(recent.toDate), 'shortDate');

        let msg = '';
        if (recent.status === 'Approved') {
          msg = `🎉 Your leave from ${formattedFromDate} to ${formattedToDate} was Approved!`;
        } else if (recent.status === 'Rejected') {
          msg = `❌ Your leave from ${formattedFromDate} to ${formattedToDate} was Rejected.`;
        }

        if (msg) {
          this.addNotification(msg);
          this.unreadNotificationCount++;
          this.unreadLeaveCount++;

          // Push this leave ID to seen list
          seenLeaveIds.push(recent.id);
        }
      });

      // Save updated seen IDs and badge counts
      localStorage.setItem('seenLeaveIds', JSON.stringify(seenLeaveIds));
      localStorage.setItem('unreadNotificationCount', this.unreadNotificationCount.toString());
      localStorage.setItem('unreadLeaveCount', this.unreadLeaveCount.toString());
    });
  }, 5000);
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
    this.unreadNotificationCount++;
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

    const leave: Leave = {
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

  logout(): void {
    this.afAuth.signOut().then(() => {
      sessionStorage.removeItem('userData');
      this.router.navigate(['/login']);
    });
  }

  openLogoutModal(): void {
    const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
    logoutModal.show();
  }

  confirmLogout(): void {
    sessionStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }

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
      let modal = bootstrap.Modal.getInstance(modalEl);
      if (!modal) {
        modal = new bootstrap.Modal(modalEl);
      }
      modal.show();
    }
  }

  openPersonalDetailsModal(): void {
    const modalElement = document.getElementById('personalDetailsModal');
    if (modalElement) {
      let modal = bootstrap.Modal.getInstance(modalElement);
      if (!modal) {
        modal = new bootstrap.Modal(modalElement);
      }
      this.personalDetails = { ...this.employee };
      this.profilePicPreview = this.employee?.profilePic || null;
      modal.show();
    }
  }

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
    this.selectedFileName = this.selectedFile.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.profilePicPreview = reader.result;
    };
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

  isDateDisabled = (date: NgbDate): boolean => {
    return this.disabledDates.some(
      disabledDate =>
        disabledDate.year === date.year &&
        disabledDate.month === date.month &&
        disabledDate.day === date.day
    );
  };
}
