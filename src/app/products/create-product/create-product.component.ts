import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ICategory, DashboardServService, IProduct, ITag } from './../../shared';
import { FormBuilder, Validators, FormArray, FormControl, ValidatorFn } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit {

  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, private route: ActivatedRoute, private serv: DashboardServService) { }

  productForm = this.fb.group({
    id: [0],
    productName: ['', Validators.required],
    productImg: ['', Validators.required],
    productCategory: [''],
    productPrice: ['', Validators.required],
    productPromoPrice: ['', Validators.required],
    productDescription: ['', Validators.required],
    productExcerpt: ['', Validators.required],
    productQuantity: ['', Validators.required],
    productTags: this.fb.array([], this.validateTagFormArray)
  });

  isCreate =  true;
  showInputFile =  true;
  productCatgories: ICategory[] = [];
  theProductTags: ITag[] = [];
  updateProductTag: string[] = [];

  invalid: any[] = [];

  ngOnInit() {
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
      if (this.route.snapshot.params.fn == 'edit' && this.route.snapshot.queryParams.product) {
        this.serv.getProduct(this.route.snapshot.queryParams.product.toString()).then(res => {
          const theProduct = res as IProduct;
          console.log('the Prd', theProduct);
          this.productForm.patchValue({
            id: theProduct.id,
            productName: theProduct.name,
            productImg: theProduct.images[0].url,
            productDescription: theProduct.description,
            productPrice: theProduct.cost,
            productCategory: theProduct.category,
            productPromoPrice: theProduct.reduced_cost,
            productExcerpt: theProduct.excerpt,
            productQuantity: theProduct.quantity,
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
            imgElem.src = theProduct.images[0].url;
            this.showInputFile = false;
          }, 500);

          console.log(this.productForm.value, this.productForm.valid);

          this.isCreate = false;
        }, err => console.error(err));
      }
    });
  }

  compareFn(c1: ICategory, c2: ICategory): boolean {
      return c1 && c2 ? c1.id === c2.id : c1 === c2;
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

    document.getElementById('imgPreview').setAttribute('value', '') as unknown as HTMLInputElement;

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
          this.serv.createProduct(product).then(res => console.log(res)).then(() => {
            Swal.fire(
              'Updated!',
              'Category ' + product.name + 'has been created successfully.',
              'success'
              );
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
        text: 'You want to update a new Product by name - ' + product.name + '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Update!',
        cancelButtonText: 'No, cancel!',
      }).then((result) => {
        if (result.value) {
          this.serv.updateProduct(product).then(res => console.log(res)).then(() => {
            Swal.fire(
              'Updated!',
              'Product ' + product.name + 'has been updated successfully.',
              'success'
              );
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
        if (ctrl.value == event.target.value) {
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
      const _discount = ((formValue.productPrice - formValue.productPromoPrice) / formValue.productPrice);
      formValue.discount = _discount;

      console.log('formValue', formValue);

      // var _form = new FormData();
      // _form.append('id', this.isCreate ? formValue.id : null);
      // _form.append('name', formValue.productName);
      // _form.append('images', formValue.productImg);
      // _form.append('category_id', formValue.productCategory.id);
      // _form.append('cost', formValue.productPrice);
      // _form.append('reduced_cost', formValue.productPromoPrice);
      // _form.append('description', formValue.productDescription);
      // _form.append('excerpt', formValue.productExcerpt);
      // _form.append('quantity', formValue.productQuantity);
      // _form.append('discount', formValue.discount);


      // console.log('_form', _form);


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
        reduced_cost: formValue.productPromoPrice,
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

  // public findInvalidControls() {
  //   const controls = this.productForm.controls;
  //   for (const name in controls) {
  //       // if (controls[name].invalid) {
  //           this.invalid.push({
  //             name: name,
  //             value: controls[name].value,
  //             invalidity: controls[name].invalid ? 'invalid' : 'valid',
  //             pristinity: controls[name].pristine ? 'pristine' : 'dirty',
  //             touched: controls[name].touched ? 'touched' : 'untouched'
  //           });
  //       // }
  //   }

  //   // console.log('findIn', invalid) ;
  // }
}
