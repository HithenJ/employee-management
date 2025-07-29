  import { Component, OnInit } from '@angular/core';
  import { EmployeeService } from '../../services/employee.service';

  @Component({
    selector: 'app-employee-list',
    templateUrl: './employee-list.component.html'
  })
  export class EmployeeListComponent implements OnInit {
    employees: any[] = [];
    showForm = false;
    selectedEmployee: any = null;
    searchText:string='';
    selectedDepartment: string = '';
    currentUserName: string = '';
    constructor(private employeeService: EmployeeService) {}

    ngOnInit(): void {
      this.getEmployees();
    
      const user = localStorage.getItem('currentUser');
      if (user) {
        const parsedUser = JSON.parse(user);
        this.currentUserName = parsedUser.name || parsedUser.email; // fallback to email if name missing
      }
    }
    getEmployees(): void {
      this.employeeService.getAll().subscribe(data => {
        this.employees = data;
      });
    }

  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      console.log(`Attempting to delete employee with ID: ${id}`); // Debug log
      this.employeeService.delete(id).subscribe({
        next: () => {
          console.log(`Employee with ID ${id} deleted successfully.`);
          this.getEmployees(); // Refresh list
        },
        error: (err) => {
          console.error('Delete failed:', err);
          alert(`Error deleting employee: ${err.message}`);
        }
      });
    }
  }

    editEmployee(employee: any): void {
      this.selectedEmployee = { ...employee }; // shallow copy to trigger change detection
      this.showForm = true;
    }
    
    addNew(): void {
      this.selectedEmployee = null;
      this.showForm = true;
    }
    

    onFormClosed(): void {
      this.showForm = false;
      this.getEmployees();
    }
    filteredEmployees() {
      return this.employees.filter(emp => {
        const isNotAdmin = emp.role !== 'admin'; // 💡 Hide admin
        const matchSearch =
          !this.searchText ||
          emp.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
          emp.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
          emp.phone.includes(this.searchText) ||
          emp.department.toLowerCase().includes(this.searchText.toLowerCase());
    
        const matchDept =
          !this.selectedDepartment || emp.department === this.selectedDepartment;
    
        return isNotAdmin && matchSearch && matchDept;
      });
    }
    

  }
