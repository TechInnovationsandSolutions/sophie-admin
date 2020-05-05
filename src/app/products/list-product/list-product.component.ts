import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardServService, ProductResponse, IProduct } from './../../shared/index';
import Swal from 'sweetalert2';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.scss']
})
export class ListProductComponent implements OnInit {
  searchText = '';
  pagesArray: Array<number> = [];
  currentPage = 1;
  products: IProduct[] = [];
  showPreloader = true;
  @BlockUI() blockUI: NgBlockUI;

  constructor(private route: ActivatedRoute, private router: Router, private service: DashboardServService) { }

  ngOnInit() {
    // console.log(this.route.snapshot.queryParams.page);
    if (!this.route.snapshot.queryParams.page) {
      console.log('no product param');
      this.router.navigate(['/products'], {
        queryParams: {
          page: 1
        },
        queryParamsHandling: 'merge'
      });
    }

    this.route.url.subscribe(r => {
      let aProm: any;

      const pg = this.route.snapshot.queryParams.page;
      this.currentPage = Number(pg);

      if (this.route.snapshot.params.id) {
        const id = +this.route.snapshot.params.id;
        aProm = this.service.getProductsByCategory(id, pg);
      } else if (this.route.snapshot.params.fn === 'search') {
        const searchhTerm = this.route.snapshot.queryParams.searchhTerm ? this.route.snapshot.queryParams.searchhTerm : '';
        aProm = this.service.getSearchedProducts(searchhTerm, pg);
      } else {
        // console.log('here');
        aProm = this.service.getProducts(pg);
      }
      aProm.then(res => {
        // console.log(pg, res);
        this.showPreloader = false;
        const resp = res as ProductResponse;
        this.pagesArray = resp.pg;
        this.products = resp.data;
      });
    });
  }

  setPage(val) {
    if (Number(val) === this.currentPage) {
    return;
    }

    this.currentPage = val;
    this.router.navigate([], { queryParams: { page: val } });
    this.setProducts(val);
  }

  setProducts(pg) {
    this.service.getProducts(pg).then(res => {
      // console.log(pg, res)
      const resp = res as ProductResponse;
      this.pagesArray = resp.pg;
      this.products = resp.data;
    });
  }

  onSearch() {
    this.router.navigate(['/products/search'], {
      queryParams: {
        searchhTerm: this.searchText
      },
      queryParamsHandling: 'merge'
    });
    // location.reload();
  }

  editProduct(theproduct: IProduct) {
    // console.log(theproduct);
    this.router.navigate(['/product/edit'], {
      queryParams: {
        currentPage: this.currentPage,
        product: theproduct.id
      }
    });
  }

  deleteProduct(product: IProduct) {
    // console.log(product);

    Swal.fire({
      title: 'Confirmation',
      text: 'You want to delete ' + product.name + ' product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#28a745'
    }).then((result) => {
      if (result.value) {
        this.blockUI.start('Processing...');
        this.service.deleteProduct(product.id.toString()).then(res => console.log(res)).then(() => {
          this.blockUI.stop();
          Swal.fire(
            'Deleted!',
            'Product ' + product.name + 'has been deleted.',
            'success'
          ).then(() => {
            location.reload();
          });
        }).catch(err => Swal.fire({
          title: 'Error',
          icon: 'error',
          text: err
        }));
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        Swal.fire(
          'Cancelled',
          'operation aborted',
          'info'
        );
      }
    });
  }

  viewProduct(product: IProduct) {
    // console.log(product);
    this.router.navigate(['/product/view'], {
      queryParams: {
        currentPage: this.currentPage,
        product: product.id
      }
    });
  }
}
