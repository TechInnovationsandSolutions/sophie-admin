import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ICategory, IProduct } from '../../shared';
import { DashboardServService, DomManipulationService } from '../../shared';
import { Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import Swal, { SweetAlertIcon } from 'sweetalert2';


@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories: ICategory[] = [];
  dataTable: any;
  selectedCheckbox: ICategory[] = [];
  showPreloader = true;
  @BlockUI() blockUI: NgBlockUI;

  constructor(
    private serv: DashboardServService,
    private chRef: ChangeDetectorRef,
    private router: Router,
    private domManipulation: DomManipulationService
  ) { }

  ngOnInit() {
    this.serv.getCatgories().then(res => {
      this.categories = res as ICategory[];
      // console.log('this.categories', this.categories);


      this.chRef.detectChanges();

      // Now you can use jQuery DataTables :
      const table: any = $('table#category-table');
      this.dataTable = table.DataTable({
        destroy: true,
        responsive: true,
        ordering: false
      });
      this.showPreloader = false;
    }).catch(err => console.error(err));
  }

  editCategory(cat: ICategory) {
    // console.log(cat);
    this.serv._category = cat;
    this.router.navigate(['/category/edit'], {
      queryParams: {
        category: cat.id
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
    return new Promise((resolveP, rejectP) => {
      const no = productList.length;
      const serviceGuy = this.serv;
      const domMan = this.domManipulation;
      // console.log('productList', productList);

      this.domManipulation.initialBulkAction(no, 'Moving Products to ' + newCat.name);
      try {
        // tslint:disable-next-line: only-arrow-functions
        const aProm = new Promise(function(resolve, reject) {
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

            let promMsg = {};

            if (messageFails && !messageFails.length) {
              msgText = 'Your selected products(s) have been moved! 🙂';
              promMsg = {
                canDelete: true
              };
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

              promMsg = {
                canDelete: false
              };
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

  moveCategoryProducts(cat: ICategory) {
    return new Promise((resP, rejP) => {
      this.blockUI.start('Processing');
      const categoryName = cat.name[0].toUpperCase() + cat.name.substring(1);
      let products: IProduct[] = [];
      this.serv.getProductsByCategory(cat.id, '1').then((res: any) => {
        this.blockUI.stop();
        products = res.data as IProduct[];
        const noProd = products.length;
        const inpOptsObj = this.getNewCatOpts([cat.id]);
        if (noProd) {
          // console.log(categoryName + ' products', products);
          const catLink = ['category', cat.id, 'products?page=1'].join('/');
          Swal.fire({
            title: 'Move ' + noProd + ' product' + (noProd > 1 ? 's' : '') + 'of ' + categoryName,
            icon: 'warning',
            // tslint:disable-next-line: max-line-length
            html: (noProd >= 20) ? 'Product move works for the first 20 products, ' + categoryName + ' has ' + noProd + ' products. <a href = "' + catLink + '">Click here to see all product and move</a>.' : '',
            input: 'select',
            inputOptions: inpOptsObj,
            inputPlaceholder: 'Select a category to move ' + categoryName + ' products',
            confirmButtonText: 'Yes, Move!',
            // confirmButtonClass: 'btn btn-sm btn-bold btn-danger',

            showCancelButton: true,
            cancelButtonText: 'No, cancel',
            // cancelButtonClass: 'btn btn-sm btn-bold btn-brand',
            inputValidator: (value) => {
              if (!value) {
                return 'You need to choose something!';
              }
            }
          }).then((r) => {
            if (r.value) {
              const selectedCat: ICategory  = {
                id: r.value,
                name: inpOptsObj[r.value],
                slug: null
              };

              this.moveProducts(products, selectedCat)
              .then(theR => resP(theR));
            }
          });
        } else {
          Swal.fire('No Products to Move', categoryName + ' has no products.', 'info');
        }
      });
    });
  }

  verifyCanDelete(cat: ICategory) {
    const catName = cat.name[0].toUpperCase() + cat.name.substring(1);
    this.blockUI.start('Verifying if ' + catName + ' can be deleted');
    this.serv.checkIfCategoryhasProducts(cat.id).then((res) => {
      this.blockUI.stop();
      const noProd = (res as any).total;

      if (noProd) {
        Swal.fire({
          icon: 'warning',
          title: catName + ' cannot be deleted!',
          // tslint:disable-next-line: max-line-length
          html: catName + 'has <strong class="text-danger">' + noProd + '</strong> product' + (noProd > 1 ? 's' : '') + '. You have to move products before you delete.',
          showCancelButton: true,
          confirmButtonText: 'Click here to move products'
        })
        .then(result => {
          if (result.value) {
            this.moveCategoryProducts(cat).then((r: any) => {
              // console.log(r);
              if (r && r.canDelete) {
                this.deleteCategory(cat);
              }
            });
          } else if (
            result.dismiss === Swal.DismissReason.cancel
          ) {
            Swal.fire(
              'Cancelled',
              'operation aborted',
              'info'
            );
          }
        });
      } else {
        this.deleteCategory(cat);
      }
    });
  }

  deleteCategory(cat: ICategory) {
    // console.log(cat);

    Swal.fire({
      title: 'Confirmation',
      text: 'You want to delete ' + cat.name + ' Category?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#28a745'
    }).then((result) => {
      if (result.value) {
        this.blockUI.start('Deleting Category ' + cat.name + ' ...');
        this.serv.deleteCategory(cat.id.toString()).then(res => {
          this.blockUI.stop();

          Swal.fire(
            'Deleted Successfully!',
            'Category ' + cat.name + 'has been deleted.',
            'success'
          ).then(() => {
            // this.router.navigate(['/category']);
            location.reload();
            // this.refreshDt();
          });
        }).catch(err => Swal.fire({
          title: 'Error',
          icon: 'error',
          text: err
        }));
      } else if (
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

  productCatList(cat: ICategory) {
    this.router.navigate(['/category', cat.id, 'products'], {queryParams: {page: 1}});
    // location.reload();
  }

  onCategoryChecked(categoryId: ICategory, e) {
    // console.log(categoryId, e, e.target.checked);
    const isInCheckList = this.selectedCheckbox.indexOf(categoryId);
    // console.log('isInCheckList', isInCheckList, 'then', !isInCheckList);

    if (e.target.checked === true && isInCheckList === -1) {
      this.selectedCheckbox.push(categoryId);
    }

    if (e.target.checked === false && isInCheckList > -1) {
      this.selectedCheckbox.splice(isInCheckList, 1);
    }

    // console.log('this.selectedCheckbox', this.selectedCheckbox);
  }

  unCheckChecked() {
    this.selectedCheckbox.forEach(c => {
      const chb = document.querySelector('input#category-checkbox-' + c.id) as HTMLInputElement;
      chb.checked = false;
    });
    this.selectedCheckbox = [];
  }

  bulkDelete() {
    const cancel = this.unCheckChecked.bind(this);
    if (this.selectedCheckbox && this.selectedCheckbox.length) {
      const no = this.selectedCheckbox.length;
      const selectdCats = this.selectedCheckbox;
      const serviceGuy = this.serv;
      const blocking = this.blockUI;
      const domMan = this.domManipulation;

      Swal.fire({
        title: 'Delete Selected Categories',
        text: 'Are you sure to delete ' + no + ' selected record(s) ?',
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
            const aProm = new Promise(function(resolve, reject) {
              const resultMsg = [];
              // tslint:disable-next-line: only-arrow-functions
              (async function() {
                // console.log('async', selectdCats);
                // tslint:disable-next-line: prefer-for-of
                for (let i = 0; i < selectdCats.length; i++) {
                  domMan.updateBulkActionValue(i + 1);
                  const obj = selectdCats[i];
                  const id = obj.id;
                  // tslint:disable-next-line: variable-name
                  const az_name = obj.name;
                  // console.log('hollq!', id);
                  await serviceGuy.checkIfCategoryhasProducts(id.toString()).then(res => {
                    const resp = res as any;
                    const noProd = (res as any).total;

                    if (!noProd) {
                      return serviceGuy.deleteCategory(id.toString()).then(response => response);
                    } else {
                      return {
                        success: false,
                        // tslint:disable-next-line: max-line-length
                        message: 'Category has ' + noProd + ' product' + (noProd > 1 ? 's' : '') + '. You have to move products before you can delete.'
                      };
                    }
                  })
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
      const no = this.selectedCheckbox.length;
      const selectdCats = this.selectedCheckbox;
      const selectdCatsId = selectdCats.map(c => c.id);
      const serviceGuy = this.serv;
      const blocking = this.blockUI;
      const domMan = this.domManipulation;

      const inpOptsObj = this.getNewCatOpts(selectdCatsId);

      Swal.fire({
        title: 'Move these selected categories',
        icon: 'info',
        text: selectdCats.length + ' categories were selected to be moved. Select a category to move them to from the drop-down',
        input: 'select',
        inputOptions: inpOptsObj,
        inputPlaceholder: 'Select a category to move selected categories',
        confirmButtonText: 'Yes, Move!',
        // confirmButtonClass: 'btn btn-sm btn-bold btn-danger',

        showCancelButton: true,
        cancelButtonText: 'No, cancel',
        // cancelButtonClass: 'btn btn-sm btn-bold btn-brand',
        inputValidator: (value) => {
          if (!value) {
            return 'You need to choose something!';
          }
        }
      }).then((r) => {
        if (r.value) {
          const theSelectedCat: ICategory  = {
            id: r.value,
            name: inpOptsObj[r.value],
            slug: null
          };

          domMan.initialBulkAction(no, 'Getting Category Products');
          try {
            // tslint:disable-next-line: only-arrow-functions
            const aProm = new Promise(function(resolve, reject) {
              const productsArr: IProduct[] = [];
              // tslint:disable-next-line: only-arrow-functions
              (async function() {
                // console.log('async', selectdCats);
                // tslint:disable-next-line: prefer-for-of
                for (let i = 0; i < selectdCats.length; i++) {
                  domMan.updateBulkActionValue(i + 1);
                  const obj = selectdCats[i];
                  const id = obj.id;
                  await serviceGuy.checkIfCategoryhasProducts(id.toString()).then(res => {
                    const noProd = (res as any).total;

                    if (noProd) {
                      (res as any).data.map(p => productsArr.push(p as IProduct));
                    }
                  });
                }
                resolve(productsArr);
              })();
            });
            aProm.then(products => {
              domMan.terminateBulkAction();
              const resp = products as IProduct[];
              // console.log('Gosh! select move', resp);
              this.moveProducts(resp, theSelectedCat);
              uncheck();
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

  refreshDt() {
    this.blockUI.start('Refreshing, Please Wait...');
    this.serv.getCatgories().then(res => {
      this.blockUI.stop();
      this.categories = res as ICategory[];
    }).catch(err => console.error(err));
  }
}
