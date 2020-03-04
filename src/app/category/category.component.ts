import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  isAddCategory:boolean = false;

  constructor() { }

  ngOnInit() {
  }

  showAddCategory(){
    this.isAddCategory = true;
  }

  hideAddCategory(){
    this.isAddCategory = false;
  }
}
