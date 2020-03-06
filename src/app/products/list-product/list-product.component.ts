import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardServService, ProductResponse, IProduct } from './../../shared/index';

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.scss']
})
export class ListProductComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private service: DashboardServService) { }

  pagesArray: Array<number> = [];
  currentPage: number = 1;
  products: IProduct[] = [];

  ngOnInit() {
    if (!this.route.snapshot.queryParams.page) {
      this.router.navigate([],{ queryParams: { page: 1 } });
      return;
    }

    const pg = this.route.snapshot.queryParams.page;
    this.currentPage = Number(pg);
    this.service.getProducts(pg).then(res=>{
      // console.log(pg, res)
      var resp = <ProductResponse>res;
      this.pagesArray = resp.pg;
      this.products = resp.data;
    });
  }

  setPage(val){
    if (Number(val) === this.currentPage)
    return;

    this.currentPage = val;
    this.router.navigate([],{ queryParams: { page: val } });
    this.setProducts(val);
  }

  setProducts(pg){
    this.service.getProducts(pg).then(res=>{
      // console.log(pg, res)
      var resp = <ProductResponse>res;
      this.pagesArray = resp.pg;
      this.products = resp.data;
    });
  }
}
