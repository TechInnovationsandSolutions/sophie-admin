import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ICategory, DashboardServService, IProduct, ITag } from './../../shared';
import { FormBuilder, Validators, FormArray, FormControl, ValidatorFn, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit {
  productForm: FormGroup;

  isCreate =  true;
  showInputFile =  true;
  productCatgories: ICategory[] = [];
  theProductTags: ITag[] = [];
  updateProductTag: string[] = [];

  invalid: any[] = [];
  showPreloader = true;
  isOnView = false;
  @BlockUI() blockUI: NgBlockUI;

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private serv: DashboardServService,
    private router: Router
  ) { }

  ngOnInit() {
    this.productForm = this.fb.group({
      id: [0],
      productName: ['', Validators.required],
      productImg: ['', Validators.required],
      productCategory: ['', Validators.required],
      productPrice: ['0', [
        Validators.required,
        Validators.min(0)]
      ],
      productPromoPrice: ['0', [
        Validators.required,
        Validators.min(0)]
      ],
      productDescription: ['', Validators.required],
      productExcerpt: ['', Validators.required],
      productQuantity: ['0', [
        Validators.required,
        Validators.required,
        Validators.min(0)]
      ],
      productTags: this.fb.array([], this.validateTagFormArray)
    }, {validator: this.comparePromoPrice});

    this.serv.getAllTags().then(res => {
      this.theProductTags = res as ITag[];
    }).then(() => {
      // this.updateProductTag = ["necessitatibus", "vitae", "quos"];
      // const formArray: FormArray = this.productForm.get('productTags') as FormArray;
      // this.updateProductTag.forEach(tag => {
      //   formArray.push(this.fb.control(tag))
      // });
      // this.productForm.get('productTags').patchValue(this.updateProductTag);
      // this.productForm.reset();
      // this.productForm.patchValue({
      //   productTags: this.updateProductTag
      // })
    });

    this.serv.getCatgories().then(res => {
      this.productCatgories = res as ICategory[];
    }).then(() => {
      console.log(this.route.snapshot.queryParams);
      if (
        (this.route.snapshot.params.fn === 'edit' || this.route.snapshot.params.fn === 'view')
        &&
        this.route.snapshot.queryParams.product) {
        this.serv.getProduct(this.route.snapshot.queryParams.product.toString()).then(res => {
          const theProduct = res as IProduct;
          console.log('the Prd', theProduct);
          this.productForm.patchValue({
            id: theProduct.id ? theProduct.id : null,
            productName: theProduct.name ? theProduct.name : null,
            productImg: (theProduct.images.length && theProduct.images[0].url) ? theProduct.images[0].url : null,
            productDescription: theProduct.description ? theProduct.description : null,
            productPrice: theProduct.cost ? theProduct.cost : 0,
            productCategory: (theProduct.category && theProduct.category.name) ? theProduct.category : null,
            productPromoPrice: theProduct.reduced_cost ? theProduct.reduced_cost : 0,
            productExcerpt: theProduct.excerpt ? theProduct.excerpt : null,
            productQuantity: theProduct.quantity ? theProduct.quantity : 0,
          });
          console.log('product tag', theProduct.tags);
          if (theProduct && theProduct.tags) {
            const formArray: FormArray = this.productForm.get('productTags') as FormArray;
            theProduct.tags.forEach(tag => {
              formArray.push(this.fb.control(tag.name));
            });
          }

          setTimeout(() => {
            const imgElem = document.getElementById('imgPreview') as HTMLImageElement;
            console.log('imhh', imgElem);
            if (imgElem && theProduct.images.length && theProduct.images[0].url) {
              imgElem.src = theProduct.images[0].url;
              this.showInputFile = false;
            }
          }, 500);

          console.log( this.productForm.valid, this.productForm.value);

          this.showPreloader = false;
          this.isCreate = false;
          this.isOnView = (this.route.snapshot.params.fn === 'view');
        }, err => console.error(err));
      } else {
        this.showPreloader = false;
      }
    });
  }

  compareFn(c1: ICategory, c2: ICategory): boolean {
      return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  enableEdit() {
    this.router.navigate(['/product/edit'], {
     queryParamsHandling: 'merge'
    });
    this.isOnView = false;
  }

  enableView(product: IProduct) {
    this.router.navigate(['/product/view'], {
      queryParams: {
        product: product.id
      },
     queryParamsHandling: 'merge'
    });
    this.isOnView = true;
    this.isCreate = false;
    this.productForm.reset({
      id: product.id ? product.id : null,
      productName: product.name ? product.name : null,
      productImg: (product.images.length && product.images[0].url) ? product.images[0].url : null,
      productDescription: product.description ? product.description : null,
      productPrice: product.cost ? product.cost : null,
      productCategory: (product.category && product.category.name) ? product.category : null,
      productPromoPrice: product.reduced_cost ? product.reduced_cost : null,
      productExcerpt: product.excerpt ? product.excerpt : null,
      productQuantity: product.quantity ? product.quantity : null,
    });

    setTimeout(() => {
      const imgElem = document.getElementById('imgPreview') as HTMLImageElement;
      console.log('imhh', imgElem);
      if (imgElem && product.images.length && product.images[0].url) {
        imgElem.src = product.images[0].url;
        this.showInputFile = false;
      }
    }, 500);

    // const $0 = document.querySelector('fieldset');

    // $0.querySelectorAll('input').forEach(r => r.setAttribute('readonly','true') );
  }

  productDiscount() {
    // tslint:disable-next-line: max-line-length
    const discount: number = (this.productForm.value.productPrice -  this.productForm.value.productPromoPrice) / this.productForm.value.productPrice;
    return discount === 1 ? 0 : discount;
  }

  comparePromoPrice(formgroup: FormGroup) {
    const promoPrice = formgroup.controls.productPromoPrice.value;
    const price = formgroup.controls.productPrice.value;
    return (promoPrice <= price ) ? null : {promoIsMore: true};
  }

  onFileChange(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      // console.log('file',file)
      // console.log('reader',reader)
      console.log('file URL', URL.createObjectURL(file));

      reader.onload = () => {
        this.productForm.patchValue({
          // productImg: event.target.files[0]
          productImg: reader.result
       });


        setTimeout(() => {
        const imgElem = document.getElementById('imgPreview') as HTMLImageElement;
        console.log('imhh', imgElem);
        imgElem.src = URL.createObjectURL(file);

        console.log('frm', 'validity => ' + this.productForm.valid, 'pristinility => ' + this.productForm.pristine, this.productForm.value);

        this.showInputFile = false;
       }, 500);
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }

  removeImg() {
    this.productForm.patchValue({
      productImg: null
    });

    this.showInputFile = true;

    const imgElem = document.getElementById('imgPreview') as HTMLInputElement;
    imgElem.setAttribute('value', '');

    console.log('frm', this.productForm.value);
  }

  createNewProduct(product: IProduct) {
    try {
      Swal.fire({
        title: 'Confirmation',
        text: 'You want to create a new Product by name - ' + product.name + '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Create!',
        cancelButtonText: 'No, cancel!',
      }).then((result) => {
        if (result.value) {
          this.blockUI.start('Creating Product ' + product.name + '...');
          this.serv.createProduct(product).then(
            (res: any) => {
            this.blockUI.stop();
            Swal.fire(
              'Created!',
              'Product ' + product.name + ' has been created successfully.',
              'success'
            );
            console.log('new res', res);
            product = res.data;
            this.enableView(product);
            // ).then(()=>location.reload())
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
    } catch (error) {
      console.error(error);
    }
  }

  updateProduct(product: IProduct) {
    try {
      Swal.fire({
        title: 'Confirmation',
        text: 'You want to update product - ' + product.name + '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Update!',
        cancelButtonText: 'No, cancel!',
      }).then((result) => {
        if (result.value) {
          this.blockUI.start('Updating Product ' + product.name + '...');
          this.serv.updateProduct(product).then((res: any) => {
            this.blockUI.stop();
            Swal.fire(
              'Updated!',
              'Product ' + product.name + 'has been updated successfully.',
              'success'
            );
            product = res.data;
            this.enableView(product);
            // ).then(()=>location.reload())
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
    } catch (error) {
      console.error(error);
    }
  }

  onTagCheck(event) {
    // console.log('event', event, this.updateProductTag);
    const formArray: FormArray = this.productForm.get('productTags') as FormArray;

  /* Selected */
    if (event.target.checked) {
      // Add a new control in the arrayForm
      console.log(event.target.name  + ' was checked');
      formArray.push(this.fb.control(event.target.value));
    } else {
      // find the unselected element
      let i = 0;

      console.log(event.target.name  + ' was unchecked');

      formArray.controls.forEach((ctrl: FormControl) => {
        if (ctrl.value === event.target.value) {
          // Remove the unselected element from the arrayForm
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
    console.log('form value', this.productForm.value);
  }

  inTagArray(tag: string) {
    // console.log('this upd', this.updateProductTag, tag, this.updateProductTag.includes(tag))
    const formArray: string[] = this.productForm.get('productTags').value;
    return formArray.includes(tag);
  }

  validateTagFormArray() {
    const min = 1; // Minimum selection.
    const validator: ValidatorFn = (formArray: FormArray) => {
      const totalSelected = formArray.controls
        // get a list of checkbox values (boolean)
        .map(control => control.value)
        // total up the number of checked checkboxes
        .reduce((prev, next) => next ? prev + next : prev, 0);

      // if the total is not greater than the minimum, return the error message
      console.log(totalSelected, min, totalSelected >= min);
      return totalSelected >= min ? null : { required: true };
    };

    return validator;
  }

  onSubmit(formValue: any) {
    try {
      // tslint:disable-next-line: variable-name
      const _discount = ((formValue.productPrice - formValue.productPromoPrice) / formValue.productPrice);
      formValue.discount = _discount;

      console.log('formValue', formValue);

      // tslint:disable-next-line: variable-name
      const _product: IProduct = {
        id: formValue.id ? formValue.id : null,
        name: formValue.productName,
        images: [
          {
            url: formValue.productImg
          }
        ],
        category: formValue.productCategory,
        cost: formValue.productPrice,
        reduced_cost: formValue.productPromoPrice ? formValue.productPromoPrice : 0,
        description: formValue.productDescription,
        excerpt: formValue.productExcerpt,
        quantity: formValue.productQuantity,
        discount: _discount.toString(),
        tags: null,
        formTags: formValue.productTags
      };
      console.log('trans-formValue', _product);
      this.isCreate ? this.createNewProduct(_product) : this.updateProduct(_product);
    } catch (error) {
      console.error(error);
    }
  }
}
