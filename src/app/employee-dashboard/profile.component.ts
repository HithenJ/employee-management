// profile.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  @Input() activeTab!: string;
  @Input() employee: any;
  @Input() hasPersonalDetails!: boolean;
  @Input() openPersonalDetailsModal!: Function;
  @Input() showPersonalDetails!: Function;
}
