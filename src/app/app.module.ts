import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoryComponent } from './category/category.component';
import { ProductsComponent } from './products/products.component';
import { CustomersComponent } from './customers/customers.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { LoginComponent } from './login/login.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AppLayoutComponent } from './app-layout/app-layout.component';
import { appRoutes } from './routes';
import { OrdersComponent } from './orders/orders.component';
import { CreateCategoryComponent } from './category/create-category/create-category.component';
import { CategoryListComponent } from './category/category-list/category-list.component';
import { SWAL_TOKEN } from './shared/swal-service.service';
import { CreateProductComponent } from './products/create-product/create-product.component';
import { ListProductComponent } from './products/list-product/list-product.component';

const swal = window['swal'];

@NgModule({
  imports: [
    BrowserModule,
    CommonModule, 
    RouterModule.forRoot(appRoutes),
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    CategoryComponent,
    ProductsComponent,
    CustomersComponent,
    TransactionsComponent,
    ReviewsComponent,
    LoginComponent,
    SidebarComponent,
    AppLayoutComponent,
    OrdersComponent,
    CreateCategoryComponent,
    CategoryListComponent,
    CreateProductComponent,
    ListProductComponent
  ],
  providers: [
    {
      provide: SWAL_TOKEN,
      useValue: swal
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
