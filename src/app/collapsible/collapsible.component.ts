import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.scss']
})
export class CollapsibleComponent implements OnInit {
  visibleSection = true;

  constructor() { }

  ngOnInit() {
  }

  toggleContent() {
    this.visibleSection = !this.visibleSection;
  }
}
