import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ICategory, DashboardServService, IProduct } from './../../shared'
import { FormBuilder, Validators } from '@angular/forms';
import Swal from "sweetalert2";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit {

  productCatgories: ICategory[] = []

  constructor(private fb: FormBuilder, private cd:ChangeDetectorRef, private route:ActivatedRoute, private serv:DashboardServService) { }

  productForm = this.fb.group({
    id:[''],
    productName: ['', Validators.required],
    productImg: ['', Validators.required],
    productCategory: [''],
    productPrice: ['', Validators.required],
    productPromoPrice: ['', Validators.required],
    productDescription: ['', Validators.required],
    productExcerpt: ['', Validators.required],
    productQuantity: ['', Validators.required]
  })

  isCreate:boolean =  true;
  showInputFile:boolean =  true;

  ngOnInit() {
    this.serv.getCatgories().then(res=>{
      this.productCatgories = <ICategory[]>res;
    }).then(()=>{
      console.log(this.route.snapshot.queryParams)
      if(this.route.snapshot.params.fn == 'edit' && this.route.snapshot.queryParams.product){
        this.serv.getProduct(this.route.snapshot.queryParams.product.toString()).then(res=>{
          const theProduct = <IProduct>res;
          console.log('the Prd', theProduct)
          this.productForm.patchValue({
            id: theProduct.id,
            productName: theProduct.name,
            productImg: theProduct.images[0].url,
            productDescription: theProduct.description,
            productPrice:theProduct.cost,
            productCategory:theProduct.category,
            productPromoPrice:theProduct.reduced_cost,
            productExcerpt:theProduct.excerpt,
            productQuantity:theProduct.quantity
          });

          setTimeout(() => {
            const imgElem = <HTMLImageElement>document.getElementById('imgPreview');
            console.log('imhh', imgElem)
            imgElem.src = theProduct.images[0].url;
            this.showInputFile = false;
          }, 500);

          console.log(this.productForm.value, this.productForm.valid)

          this.isCreate = false;
        }, err=>console.error(err));
      }
    })
  }

  compareFn(c1: ICategory, c2: ICategory): boolean {
      return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  onFileChange(event) {
    const reader = new FileReader();
 
    if(event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      // console.log('file',file)
      // console.log('reader',reader)
      console.log('file URL',URL.createObjectURL(file))
  
      reader.onload = () => {
        this.productForm.patchValue({
          // productImg: event.target.files[0]
          productImg: reader.result
       });

       console.log('frm', this.productForm.value);

       setTimeout(() => {
        const imgElem = <HTMLImageElement>document.getElementById('imgPreview');
        console.log('imhh', imgElem)
        imgElem.src = URL.createObjectURL(file);
       }, 500);
      
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }

  removeImg(){
    this.productForm.patchValue({
      img: null
    });

    this.showInputFile = true;

    <HTMLInputElement><unknown>document.getElementById('category-img').setAttribute('value', null)

   console.log('frm', this.productForm.value);
  }

  createNewProduct(product:IProduct){
    try {
      Swal.fire({
        title: 'Confirmation',
        text: "You want to create a new Product by name - " + product.name + "?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Create!',
        cancelButtonText: 'No, cancel!',
      }).then((result) => {
        if (result.value) {
          this.serv.createProduct(product).then(res=>console.log(res)).then(()=>{
            Swal.fire(
              'Updated!',
              'Category '+ product.name + 'has been successfully update.',
              'success'
              )
            // ).then(()=>location.reload())
          }).catch(err=>Swal.fire({
            title: 'Error',
            icon: 'error',
            text:err
          }))
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          Swal.fire(
            'Cancelled',
            'operation aborted',
            'info'
          )
        }
      })
    } catch (error) {
      console.error(error);
    }
  }

  updateProduct(product:IProduct){
    try {
      Swal.fire({
        title: 'Confirmation',
        text: "You want to create a new Product by name - " + product.name + "?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Create!',
        cancelButtonText: 'No, cancel!',
      }).then((result) => {
        if (result.value) {
          this.serv.updateProduct(product).then(res=>console.log(res)).then(()=>{
            Swal.fire(
              'Updated!',
              'Category '+ product.name + 'has been successfully update.',
              'success'
              )
            // ).then(()=>location.reload())
          }).catch(err=>Swal.fire({
            title: 'Error',
            icon: 'error',
            text:err
          }))
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          Swal.fire(
            'Cancelled',
            'operation aborted',
            'info'
          )
        }
      })
    } catch (error) {
      console.error(error);
    }
  }

  onSubmit(formValue:any){
    try {
      var _discount = ((formValue.productPrice - formValue.productPromoPrice)/formValue.productPrice);
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
      

      var _product:IProduct = {
        id: formValue.id ? formValue.id : null,
        name: formValue.productName,
        images:[
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
      };
      console.log('trans-formValue', _product);
      this.isCreate ? this.createNewProduct(_product) : this.updateProduct(_product);
    } catch (error) {
      console.error(error);
    }
  }
}
