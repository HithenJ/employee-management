import {
  Component, Input, Output, EventEmitter,
  OnInit, OnChanges, SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html'
})
export class EmployeeFormComponent implements OnInit, OnChanges {
  @Input() employee: any = null;
  @Output() formClosed = new EventEmitter<void>();

  employeeForm!: FormGroup;
  isEditMode = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee']) {
      this.isEditMode = !!(this.employee && this.employee.id);
      this.initForm();
    }
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      name: [this.employee?.name || '', Validators.required],
      email: [this.employee?.email || '', [Validators.required, Validators.email]],
      phone: [this.employee?.phone || '', Validators.required],
      department: [this.employee?.department || '', Validators.required],
      salary: [this.employee?.salary || '', Validators.required],
      role: [this.employee?.role || '', Validators.required]

    });

    this.successMessage = ''; // Reset success message on init
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) return;

    const formData = this.employeeForm.value;

    if (this.isEditMode) {
      this.employeeService.update(this.employee.id, formData).subscribe({
        next: () => {
          this.successMessage = 'Employee updated successfully!';
          this.formClosed.emit();
        },
        error: (err) => console.error('Error updating employee', err)
      });
    } else {
      this.employeeService.create(formData).subscribe({
        next: () => {
          this.successMessage = 'New employee added successfully!';
          this.employeeForm.reset();
        },
        error: (err) => console.error('Error creating employee', err)
      });
    }
  }

  cancel(): void {
    this.formClosed.emit();
  }
}
