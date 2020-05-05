import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { DashboardServService, ITag } from 'src/app/shared';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-create-tags',
  templateUrl: './create-tags.component.html',
  styleUrls: ['./create-tags.component.scss']
})
export class CreateTagsComponent implements OnInit {

  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, private route: ActivatedRoute, private serv: DashboardServService) { }

  tagForm = this.fb.group({
    name: ['', Validators.required],
    id: [''],
  });
  showPreloader = true;
  isCreate =  true;
  @BlockUI() blockUI: NgBlockUI;

  ngOnInit() {
    if (this.route.snapshot.params.fn === 'edit' && this.serv._tag) {
      const theTag: ITag = this.serv._tag;
      this.serv._tag = null;

      this.tagForm.patchValue({
        name: theTag.name,
      });
      this.isCreate = false;
      this.showPreloader = false;
    } else if (this.route.snapshot.params.fn === 'add') {
      this.showPreloader = false;
    }
  }


  createNewTag(tag: ITag) {
    Swal.fire({
      title: 'Confirmation',
      text: 'You want to create a new tag by name - ' + tag.name + '?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Create!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.value) {
        this.blockUI.start('Creating new tag - ' + tag.name);
        this.serv.createTag(tag.name).then(res => {
          this.blockUI.stop();
          Swal.fire(
            'Created!',
            'tag ' + tag.name + 'has been successfully created.',
            'success'
          ).then(() => location.reload());
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

  updateNewTag(tag: ITag) {
    Swal.fire({
      title: 'Confirmation',
      text: 'You want to update the details of ' + tag.name + '?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Update!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.value) {
        this.blockUI.start('Updating tag - ' + tag.name);
        this.serv.updateTag(tag.name).then(res => {
          this.blockUI.stop();

          Swal.fire(
            'Updated!',
            'tag ' + tag.name + 'has been successfully update.',
            'success'
          ).then(() => location.reload());
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

  onSubmit(formValue) {
    this.isCreate ? this.createNewTag(formValue) : this.updateNewTag(formValue);
  }
}
