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

  searchText:string = '';
  pagesArray: Array<number> = [];
  currentPage: number = 1;
  products: IProduct[] = [];

  ngOnInit() {
    console.log(this.route.snapshot.params);
    if (!this.route.snapshot.queryParams.page) {
      this.router.navigate([],{ 
        queryParams: { 
          page: 1 
        },
        queryParamsHandling: 'merge'
      });
      return;
    }

    var aProm:any;

    const pg = this.route.snapshot.queryParams.page;
    this.currentPage = Number(pg);

    if(this.route.snapshot.params.id){
      const id = +this.route.snapshot.params.id;
      aProm = this.service.getProductsByCategory(id, pg);
    } else if (this.route.snapshot.params.fn == 'search') {
      const searchhTerm = this.route.snapshot.queryParams.searchhTerm ? this.route.snapshot.queryParams.searchhTerm : '';
      aProm = this.service.getSearchedProducts(searchhTerm, pg)
    }
    else{
      aProm = this.service.getProducts(pg)
    }
    aProm.then(res=>{
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

  onSearch(){
    this.router.navigate(['/products/search'], {
      queryParams:{
        searchhTerm: this.searchText
      },
      queryParamsHandling: 'merge'
    });
    // location.reload();
  }
}
