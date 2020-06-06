import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardServService, ProductResponse, IProduct, DomManipulationService, ICategory } from './../../shared/index';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.scss']
})
export class ListProductComponent implements OnInit {
  searchText = '';
  selectedCheckbox: IProduct[] = [];
  pagesArray: Array<number> = [];
  currentPage = 1;
  products: IProduct[] = [];
  showPreloader = true;
  @BlockUI() blockUI: NgBlockUI;
  categories: ICategory[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: DashboardServService,
    private domManipulation: DomManipulationService
    ) { }

  ngOnInit() {
    // // console.log(this.route.snapshot.queryParams.page);
    if (!this.route.snapshot.queryParams.page) {
      // console.log('no product param');
      this.router.navigate(['/products'], {
        queryParams: {
          page: 1
        },
      });
    }

    this.route.url.subscribe(() => {
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
        // // console.log('here');
        aProm = this.service.getProducts(pg);
      }
      aProm.then(res => {
        // // console.log(pg, res);
        this.showPreloader = false;
        const resp = res as ProductResponse;
        this.pagesArray = resp.pg;
        this.products = resp.data;
      });
    });

    this.service.getCatgories().then(res => {
      this.categories = res as ICategory[];
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
      // // console.log(pg, res)
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
    // // console.log(theproduct);
    this.router.navigate(['/product/edit'], {
      queryParams: {
        currentPage: this.currentPage,
        product: theproduct.id
      }
    });
  }

  deleteProduct(product: IProduct) {
    // // console.log(product);

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
        this.service.deleteProduct(product.id.toString()).then(() => {
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
    // // console.log(product);
    this.router.navigate(['/product/view'], {
      queryParams: {
        currentPage: this.currentPage,
        product: product.id
      }
    });
  }

  moveThisProduct(product: IProduct) {
    const idArr: number[] = (product.category && product.category.id) ? [product.category.id] : [];
    const inpOptsObj = this.getNewCatOpts(idArr);

    Swal.fire({
      title: 'Move ' + product.name + ' to another category',
      icon: 'info',
      input: 'select',
      inputOptions: inpOptsObj,
      inputPlaceholder: 'Select a category to move selected products',
      confirmButtonText: 'Yes, Move!',
      // confirmButtonClass: 'btn btn-sm btn-bold btn-danger',

      showCancelButton: true,
      cancelButtonText: 'No, cancel',
      // cancelButtonClass: 'btn btn-sm btn-bold btn-brand',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to choose a category!';
        }
      }
    }).then((r) => {
      if (r.value) {
        const theSelectedCat: ICategory  = {
          id: r.value,
          name: inpOptsObj[r.value],
          slug: null
        };

        this.moveProducts([product], theSelectedCat).then(() => window.location.reload());
      } else {
        Swal.fire({
          title: 'Cancelled',
          text: 'You selected categories have not been moved! :)',
          icon: 'info',
          buttonsStyling: false,
          confirmButtonText: 'OK',
        });
      }
    });
  }

  makeThisProductOutOfStock(product: IProduct) {
    product.discount = ((product.cost - product.reduced_cost)/product.cost).toString();
    if (product.quantity < 1) {
      Swal.fire('No Quantity', product.name + ' has no quantity and hence cannot be made out of stock', 'info');
      return;
    }

    Swal.fire({
      title: 'Confirmation',
      text: 'You want to make ' + product.name + ' product as out of stock?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Make out of stock!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#28a745'
    }).then((result) => {
      if (result.value) {
        this.blockUI.start('Processing...');
        this.service.setProductToOutOfStock(product).then(() => {
          this.blockUI.stop();
          Swal.fire(
            'Successful!',
            'Product ' + product.name + 'has been made out of stock.',
            'success'
          ).then(() => {
            // location.reload();
            product.quantity = 0;
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

  getNewCatOpts(arr: number[]) {
    const inpOpts = {};
    const idArry = this.categories.map(c => c.id);
    // tslint:disable-next-line: variable-name
    const _categories = this.categories.slice(0);
    arr.forEach(i => {
      const ind = idArry.indexOf(i);
      if (ind > -1) {
        _categories.splice(ind, 1);
      }
    });
    _categories.forEach(c => {
      inpOpts[c.id] = c.name[0].toUpperCase() + c.name.substring(1);
    });

    return inpOpts;
  }

  moveProducts(productList: IProduct[], newCat: ICategory) {
    return new Promise((resolveP) => {
      const no = productList.length;
      const serviceGuy = this.service;
      const domMan = this.domManipulation;
      // console.log('productList', productList);

      this.domManipulation.initialBulkAction(no, 'Moving Products to ' + newCat.name);
      try {
        // tslint:disable-next-line: only-arrow-functions
        const aProm = new Promise(function(resolve) {
          const resultMsg = [];
          // tslint:disable-next-line: only-arrow-functions
          (async function() {
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < productList.length; i++) {
              domMan.updateBulkActionValue(i + 1);
              const product = productList[i];
              const id = product.id;
              // tslint:disable-next-line: variable-name
              const prodName = product.name;
              // console.log('hollq!', id);
              await serviceGuy.updateProductCategory(product, newCat.id).then(res => {
                // console.log('b4 Gosh Res updateProd', res);
                if (res) {
                  return res;
                }
              })
              .then(resp => {
                // // console.log('b4 Gosh', resp);
                resultMsg.push({
                  username: prodName,
                  msg: resp
                });
              });
            }
            resolve(resultMsg);
          })();
        });
        aProm.then(res => {
          domMan.terminateBulkAction();
          const resp = res as any[];
          // console.log('resultMsg Gosh!', resp);
          if (resp) {
            let messageFails = [];
            messageFails = resp.filter(r => r.msg.status !== 'success');

            // tslint:disable-next-line: one-variable-per-declaration
            let msgType: SweetAlertIcon = 'success', msgText = '', msgHtml = '';

            const promMsg = {
              status: true
            };

            if (messageFails && !messageFails.length) {
              msgText = 'Your selected products(s) have been moved! 🙂';
            } else if (messageFails.length) {
              let output = '';

              // tslint:disable-next-line: prefer-for-of
              for (let i = 0; i < messageFails.length; i++) {
              const 	mf = messageFails[i];
              // tslint:disable-next-line: max-line-length
              output += '<li class="pb-2"><p><strong class="text-capitalize">Product ' +  mf.username + '</strong> was not moved - <em class="text-danger">' + mf.msg.message + '</em>.</p></li>';
              }

              msgText = (resp.length > messageFails.length) ? 'Your selected products have been moved except the following:' :
              (resp.length === messageFails.length) ? 'Your selected products were not moved!' : '';

              msgHtml = msgText + '<br><ol>' + output + '</ol>';
              msgType = 'warning';
            }

            Swal.fire({
              title: 'Done!',
              text: msgText,
              icon: msgType,
              html: msgHtml,
              buttonsStyling: false,
              confirmButtonText: 'OK'
            });
            resolveP(promMsg);
            // .then(() => location.reload());
            // .then(()=> loadFn());
          }
        });
      } catch (error) {
        this.blockUI.stop();
        Swal.fire({
          title: 'Error Occurred!',
          icon: 'error',
          buttonsStyling: false,
          confirmButtonText: 'Reload',
        })
        .then(() => document.location.reload());
      }
    });
  }

  onProductChecked(prod: IProduct, e) {
    // console.log(prod, e, e.target.checked);
    const isInCheckList = this.selectedCheckbox.indexOf(prod);
    // console.log('isInCheckList', isInCheckList, 'then', !isInCheckList);

    if (e.target.checked === true && isInCheckList === -1) {
      this.selectedCheckbox.push(prod);
    }

    if (e.target.checked === false && isInCheckList > -1) {
      this.selectedCheckbox.splice(isInCheckList, 1);
    }

    // console.log('this.selectedCheckbox', this.selectedCheckbox);
  }

  unCheckChecked() {
    this.selectedCheckbox.forEach(c => {
      const chb = document.querySelector('input#product-checkbox-' + c.id) as HTMLInputElement;
      chb.checked = false;
    });
    this.selectedCheckbox = [];
  }

  bulkDelete() {
    const cancel = this.unCheckChecked.bind(this);
    if (this.selectedCheckbox && this.selectedCheckbox.length) {
      const no = this.selectedCheckbox.length;
      const selectedProd = this.selectedCheckbox;
      const serviceGuy = this.service;
      const blocking = this.blockUI;
      const domMan = this.domManipulation;

      Swal.fire({
        title: 'Delete Selected Categories',
        text: 'Are you sure to delete ' + no + ' selected products(s) ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete!',
        cancelButtonText: 'No, cancel'
      // tslint:disable-next-line: only-arrow-functions
      }).then(function(result) {
        if (result.value) {
          domMan.initialBulkAction(no, 'Deleting');
          try {
            // tslint:disable-next-line: only-arrow-functions
            const aProm = new Promise(function(resolve) {
              const resultMsg = [];
              // tslint:disable-next-line: only-arrow-functions
              (async function() {
                // console.log('async', selectedProd);
                // tslint:disable-next-line: prefer-for-of
                for (let i = 0; i < selectedProd.length; i++) {
                  domMan.updateBulkActionValue(i + 1);
                  const obj = selectedProd[i];
                  const id = obj.id;
                  // tslint:disable-next-line: variable-name
                  const az_name = obj.name;
                  // console.log('hollq!', id);
                  await serviceGuy.deleteProduct(id.toString())
                  .then(resp => {
                    // // console.log('b4 Gosh', resp);
                    resultMsg.push({
                      username: az_name,
                      msg: resp
                    });
                  });
                }
                resolve(resultMsg);
              })();
            });

            aProm.then(res => {
              domMan.terminateBulkAction();
              const resp = res as any[];
              // console.log('Gosh!', resp);
              if (resp) {
                let messageFails = [];
                messageFails = resp.filter(r => r.msg &&  r.msg.status !== 'success');

                // tslint:disable-next-line: one-variable-per-declaration
                let msgType: SweetAlertIcon = 'success', msgText = '', msgHtml = '';

                if (messageFails && messageFails.length === 0) {
                  msgText = 'Your selected record(s) have been deleted! 🙂';
                } else if (messageFails.length > 0) {
                  let output = '';

                  // tslint:disable-next-line: prefer-for-of
                  for (let i = 0; i < messageFails.length; i++) {
                  const 	mf = messageFails[i];
                  // tslint:disable-next-line: max-line-length
                  output += '<li class="pb-2"><p><strong class="text-capitalize">Category ' +  mf.username + '</strong> was not deleted - <em class="text-danger">' + mf.msg.message + '</em>.</p></li>';
                  }

                  msgText = (resp.length > messageFails.length) ? 'Your selected categories have been deleted except the following:' :
                  (resp.length === messageFails.length) ? 'Your selected categoriess were not deleted!' : '';

                  msgHtml = msgText + '<br><ol>' + output + '</ol>';
                  msgType = 'warning';
                }

                Swal.fire({
                  title: 'Done!',
                  text: msgText,
                  icon: msgType,
                  html: msgHtml,
                  buttonsStyling: false,
                  confirmButtonText: 'OK'
                })
                .then(() => {
                  location.reload();
                  // this.refreshDt();
                });
                // .then(()=> loadFn());
              }
            });
          } catch (error) {
            blocking.stop();
            Swal.fire({
              title: 'Error Occurred!',
              icon: 'error',
              buttonsStyling: false,
              confirmButtonText: 'Reload',
            })
            .then(() => document.location.reload());
          }
        } else {
          // const qq = document.querySelectorAll('.category-chb');
          // qq.forEach(e => (e as any).checked = false);
          cancel();


          Swal.fire({
            title: 'Cancelled',
            text: 'You selected record(s) have not been deleted! :)',
            icon: 'info',
            buttonsStyling: false,
            confirmButtonText: 'OK',
          });
        }
      });
    }
  }

  bulkMove() {
    const uncheck = this.unCheckChecked.bind(this);
    if (this.selectedCheckbox && this.selectedCheckbox.length) {
      const selectedProd = this.selectedCheckbox;

      const inpOptsObj = this.getNewCatOpts([]);

      Swal.fire({
        title: 'Move these selected products',
        icon: 'info',
        text: selectedProd.length + ' products were selected to be moved. Select a category to move them to from the drop-down',
        input: 'select',
        inputOptions: inpOptsObj,
        inputPlaceholder: 'Select a category to move selected products',
        confirmButtonText: 'Yes, Move!',
        // confirmButtonClass: 'btn btn-sm btn-bold btn-danger',

        showCancelButton: true,
        cancelButtonText: 'No, cancel',
        // cancelButtonClass: 'btn btn-sm btn-bold btn-brand',
        inputValidator: (value) => {
          if (!value) {
            return 'You need to choose a category!';
          }
        }
      }).then((r) => {
        if (r.value) {
          const theSelectedCat: ICategory  = {
            id: r.value,
            name: inpOptsObj[r.value],
            slug: null
          };

          this.moveProducts(selectedProd, theSelectedCat).then(() => window.location.reload());
        } else {
          uncheck();
          Swal.fire({
            title: 'Cancelled',
            text: 'You selected categories have not been moved! :)',
            icon: 'info',
            buttonsStyling: false,
            confirmButtonText: 'OK',
          });
        }
      });
    }
  }
}
