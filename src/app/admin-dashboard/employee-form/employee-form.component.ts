import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html'
})
export class EmployeeFormComponent implements OnInit {
  @Input() employee: any = null; // If null, form will be "Add" mode, else "Edit"
  @Output() formClosed = new EventEmitter<void>();

  employeeForm: FormGroup | any;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      name: [this.employee?.name || '', Validators.required],
      email: [this.employee?.email || '', [Validators.required, Validators.email]],
      phone: [this.employee?.phone || '', Validators.required],
      department: [this.employee?.department || '', Validators.required],
      salary: [this.employee?.salary || '', Validators.required]
    });
  }
  
  onSubmit(): void {
    console.log("Form Data:", this.employeeForm.value); // 👈 Add this
  
    if (this.employee?.id) {
      this.employeeService.update(this.employee.id, this.employeeForm.value).subscribe(() => {
        alert('Employee updated successfully!');
        this.formClosed.emit();
      });
    } else {
      this.employeeService.create(this.employeeForm.value).subscribe(() => {
        alert('Employee added successfully!');
        this.formClosed.emit();
      });
    }
  }
  

  cancel(): void {
    this.formClosed.emit();
  }
}
