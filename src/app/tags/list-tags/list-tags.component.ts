import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ITag, DashboardServService, DomManipulationService } from '../../shared';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { Router } from '@angular/router';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-list-tags',
  templateUrl: './list-tags.component.html',
  styleUrls: ['./list-tags.component.scss']
})
export class ListTagsComponent implements OnInit {
  tags: ITag[] = [];
  dataTable: any;
  selectedCheckbox: ITag[] = [];
  showPreloader = true;
  @BlockUI() blockUI: NgBlockUI;

  constructor(
    private serv: DashboardServService,
    private chRef: ChangeDetectorRef,
    private router: Router,
    private domManipulation: DomManipulationService
  ) { }

  ngOnInit() {
    this.serv.getAllTags().then(res => {
      this.tags = res as ITag[];
      // console.log('this.tags', this.tags);

      this.chRef.detectChanges();

      // Now you can use jQuery DataTables :
      const table: any = $('table#tag-table');
      this.dataTable = table.DataTable({
        destroy: true,
        responsive: true,
        ordering: false
      });
      this.showPreloader = false;
    }).catch(err => console.error(err));
  }

  editTag(tag: ITag) {
    // console.log(tag);
    this.serv._tag = tag;
    this.router.navigate(['/tag/edit'], {
      queryParams: {
        Tag: tag.id
      }
    });
  }

  deleteTag(tag: ITag) {
    // console.log(tag);

    Swal.fire({
      title: 'Confirmation',
      text: 'You want to delete ' + tag.name + ' Tag?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#28a745'
    }).then((result) => {
      if (result.value) {
        this.blockUI.start('Deleting tag ' + tag.name);
        this.serv.deleteTag(tag.id).then(res => {
          this.blockUI.stop();
          Swal.fire(
            'Deleted!',
            'Tag ' + tag.name + 'has been deleted.',
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

  productTagList(tag: ITag) {
    this.router.navigate(['/tag', tag.id, 'products'], {
      queryParams: {
        page: 1,
        tagName: tag.name
      }
    });
  }

  onTagChecked(categoryId: ITag, e) {
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
      const chb = document.querySelector('input#tag-checkbox-' + c.id) as HTMLInputElement;
      chb.checked = false;
    });
    this.selectedCheckbox = [];
  }

  bulkDelete() {
    const cancel = this.unCheckChecked.bind(this);
    if (this.selectedCheckbox && this.selectedCheckbox.length) {
      const no = this.selectedCheckbox.length;
      const selectdTags = this.selectedCheckbox;
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
                // console.log('async', selectdTags);
                // tslint:disable-next-line: prefer-for-of
                for (let i = 0; i < selectdTags.length; i++) {
                  domMan.updateBulkActionValue(i + 1);
                  const obj = selectdTags[i];
                  const id = obj.id;
                  // tslint:disable-next-line: variable-name
                  const az_name = obj.name;
                  await serviceGuy.deleteTag(id)
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
              // // console.log('Gosh!', resp);
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
                  output += '<li class="pb-2"><p><strong class="text-capitalize">Tag ' +  mf.username + '</strong> was not deleted - <em class="text-danger">' + mf.msg.message + '</em>.</p></li>';
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
}
