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

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees(): void {
    this.employeeService.getAll().subscribe(data => {
      this.employees = data;
    });
  }

  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      console.log(`Attempting to delete employee with ID: ${id}`); // Debugging log
      this.employeeService.delete(id).subscribe({
        next: () => {
          console.log(`Employee with ID ${id} deleted successfully.`);
          this.getEmployees(); // Refresh list after delete
        },
        error: (err) => {
          console.error('Delete failed:', err);
          alert(`Error deleting employee: ${err.message}`);
        }
      });
    }
  }
  
  editEmployee(employee: any): void {
    this.selectedEmployee = employee;
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
}
