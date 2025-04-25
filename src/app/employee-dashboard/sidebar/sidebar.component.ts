// sidebar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Input() activeTab!: string;
  @Output() tabChange = new EventEmitter<string>();

  setActiveTab(tab: string): void {
    this.tabChange.emit(tab);
  }
}
