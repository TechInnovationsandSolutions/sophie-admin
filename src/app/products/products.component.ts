import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  isAddProduct:boolean = false;

  constructor() { }

  ngOnInit() {
  }

  showAddProduct(){
    this.isAddProduct = true;
  }

  hideAddProduct(){
    this.isAddProduct = false;
  }

}
