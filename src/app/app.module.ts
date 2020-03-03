import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";

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

@NgModule({
  imports: [
    BrowserModule,
    CommonModule, 
    RouterModule
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
    AppLayoutComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
