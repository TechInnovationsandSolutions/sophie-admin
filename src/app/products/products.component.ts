import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  isAddProduct = false;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    if (this.route.snapshot.params) {
      const fn = this.route.snapshot.params.fn;
      if (fn == 'add' || fn == 'edit') {
        this.isAddProduct = true;
      }
      // else {
      //   this.router.navigate(['/products']);
      // }
    }
  }

  showAddProduct() {
    this.router.navigate(['/product/add']);
  }

  hideAddProduct() {
    console.log(this.route.snapshot.queryParams.currentPage);

    if (this.route.snapshot.queryParams.currentPage) {
      this.router.navigate(['/products'], {
        queryParams: {
          page: this.route.snapshot.queryParams.currentPage
        },
      });
    } else {
      this.router.navigate(['/products'], {
        queryParams: {
          page: 1
        },
      });
    }
  }

}
