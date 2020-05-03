import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ICategory } from 'src/app/shared';
import { DataTableDirective } from 'angular-datatables';

import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { DashboardServService } from 'src/app/shared/services/dashboard-serv.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';


@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories: ICategory[] = [];
  // dtElement: DataTableDirective;
  // dtOptions:DataTables.Settings = {};
  dataTable: any;
  private selectedCheckbox: ICategory[] = [];

  constructor(private serv: DashboardServService, private chRef: ChangeDetectorRef, private router: Router) { }

  ngOnInit() {
    this.serv.getCatgories().then(res => {
      this.categories = res as ICategory[];
      console.log('this.categories', this.categories);


      this.chRef.detectChanges();

      // Now you can use jQuery DataTables :
      const table: any = $('table#category-table');
      this.dataTable = table.DataTable({
        destroy: true,
        responsive: true,
        ordering: false
      });
    }).catch(err => console.error(err));
    // this.dtOptions = {
    //   pagingType: 'full_numbers',
    //   responsive: true,
    //   serverSide: true,
    //   processing: true,
    //   columns: [{ data: 'id' }, { data: 'Name' }]
    // };
  }

  // ngAfterViewInit(): void {
  //   this.dtElement.dtInstance.then((dtInstance: any) => {
  //     console.info("foobar");
  //     dtInstance.columns.adjust()
  //        .responsive.recalc();
  //   });
  // }

  editCategory(cat: ICategory) {
    console.log(cat);
    this.serv._category = cat;
    this.router.navigate(['/category/edit'], {
      queryParams: {
        category: cat.id
      }
    });
  }

  deleteCategory(cat: ICategory) {
    console.log(cat);

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
        this.serv.deleteCategory(cat.id.toString()).then(res => console.log(res)).then(() => {
          Swal.fire(
            'Deleted!',
            'Category ' + cat.name + 'has been deleted.',
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

  productCatList(cat: ICategory) {
    this.router.navigate(['/category', cat.id, 'products'], {queryParams: {page: 1}});
    // location.reload();
  }

  onCategoryChecked(categoryId: ICategory, e) {
    console.log(categoryId, e, e.target.checked);
    const isInCheckList = this.selectedCheckbox.indexOf(categoryId);
    console.log('isInCheckList', isInCheckList, 'then', !isInCheckList);

    if (e.target.checked == true && isInCheckList === -1) {
      this.selectedCheckbox.push(categoryId);
    }

    if (e.target.checked == false && isInCheckList > -1) {
      this.selectedCheckbox.splice(isInCheckList, 1);
    }

    console.log('this.selectedCheckbox', this.selectedCheckbox);
  }

  bulkDelete() {
    if (this.selectedCheckbox && this.selectedCheckbox.length) {
      const no = this.selectedCheckbox.length;
      const selectdCats = this.selectedCheckbox;
      const serviceGuy = this.serv;

      Swal.fire({
        title: 'Delete Selected Categories',
        text: 'Are you sure to delete ' + no + ' selected record(s) ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete!',
        cancelButtonText: 'No, cancel'
      }).then(function(result) {
        if (result.value) {
          try {

            const aProm = new Promise(function(resolve, reject) {
              const resultMsg = [];
              (async function() {
                console.log('async', selectdCats);
                for (let i = 0; i < selectdCats.length; i++) {
                  const obj = selectdCats[i];
                  const id = obj.id;
                  const az_name = obj.name;
                  console.log('hollq!', id);
                  await serviceGuy.deleteCategory(id.toString()).then(res => {
                    const resp = res as any;
                    if (resp.success) {
                      return resp;
                    }
                  })
                  .then(resp => {
                    // console.log('b4 Gosh', resp);
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
              const resp = res as any[];
              // console.log('Gosh!', resp);
              if (resp) {
                let messageFails = [];
                messageFails = resp.filter(r => r.msg === false);

                let msgType = '', msgText = '', msgHtml = '';

                if (messageFails && messageFails.length === 0) {
                  msgText = 'Your selected record(s) have been deleted! 🙂';
                  msgType = 'success';
                } else if (messageFails.length > 0) {
                  let output = '';

                  for (let i = 0; i < messageFails.length; i++) {
                  const 	mf = messageFails[i];
                  output += '<li><p="text-capitalize">' +  mf.username + '</strong> was not deleted - <em>' + mf.msg + '</em>.</p></li>';
                  }

                  msgText = (resp.length > messageFails.length) ? 'Your selected record(s) have been deleted except the following:' : '';
                  msgHtml = msgText + '<br><ol>' + output + '</ol>';
                  msgType = 'warning';
                }

                Swal.fire({
                  title: 'Done!',
                  text: msgText,
                  icon: (msgType == 'success') ? 'success' : 'warning' ,
                  html: msgHtml,
                  buttonsStyling: false,
                  confirmButtonText: 'OK'
                })
                .then(() => location.reload());
                // .then(()=> loadFn());
              }
            });

          } catch (error) {
            console.error(error);
            Swal.fire({
              title: 'Error Occurred!',
              icon: 'error',
              buttonsStyling: false,
              confirmButtonText: 'Reload',
            })
            .then(() => document.location.reload());
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: 'Cancelled',
            text: 'You selected record(s) have not been deleted! :)',
            icon: 'error',
            buttonsStyling: false,
            confirmButtonText: 'OK',
          });
        }
      });
    }
  }
}
