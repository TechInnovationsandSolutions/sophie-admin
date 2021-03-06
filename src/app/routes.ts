import { Routes } from '@angular/router';
// import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoryComponent } from './category/category.component';
import { CustomersComponent } from './customers/customers.component';
// import { TransactionsComponent } from './transactions/transactions.component';
// import { ReviewsComponent } from './reviews/reviews.component';
import { ProductsComponent } from './products/products.component';
import { LoginComponent } from './login/login.component';
import { AuthGuardGuard } from './shared';
import { TagsComponent } from './tags/tags.component';
import { AllOrdersComponent } from './all-orders/all-orders.component';
import { CustomerPageComponent } from './customer-page/customer-page.component';

export const appRoutes: Routes = [
    // {
    //     path: 'dashboard',
    //     component: DashboardComponent,
    //     canActivate: [AuthGuardGuard]
    // },
    {
        path: 'categories',
        component: CategoryComponent,
        canActivate: [AuthGuardGuard]
    },
    {
        path: 'category/:fn',
        component: CategoryComponent,
        canActivate: [AuthGuardGuard]
    },
    {
        path: 'category/:id/products',
        component: ProductsComponent
    },
    {
        path: 'orders',
        component: AllOrdersComponent,
        canActivate: [AuthGuardGuard]
    },
    {
      path: 'customer/:id',
      component: CustomerPageComponent,
      canActivate: [AuthGuardGuard]
    },
    {
      path: 'customer',
      redirectTo: 'customers',
      pathMatch: 'full'
    },
    {
        path: 'customers',
        component: CustomersComponent,
        canActivate: [AuthGuardGuard]
    },
    // {
    //     path: 'transactions',
    //     component: TransactionsComponent,
    //     canActivate: [AuthGuardGuard]
    // },
    // {
    //     path: 'reviews',
    //     component: ReviewsComponent,
    //     canActivate: [AuthGuardGuard]
    // },
    {
        path: 'products/:fn',
        component: ProductsComponent,
        canActivate: [AuthGuardGuard]
    },
    {
        path: 'products',
        component: ProductsComponent,
        canActivate: [AuthGuardGuard]
    },
    // {
    //     path: 'products/view/:id',
    //     component: ProductsComponent,
    //     canActivate: [AuthGuardGuard]
    // },
    {
        path: 'product/:fn',
        component: ProductsComponent,
        canActivate: [AuthGuardGuard]
    },
    {
        path: 'tag/:fn',
        component: TagsComponent,
        canActivate: [AuthGuardGuard]
    },
    {
        path: 'tag/:id/products',
        component: ProductsComponent
    },
    {
        path: 'tags',
        component: TagsComponent,
        canActivate: [AuthGuardGuard]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        redirectTo: 'orders',
        pathMatch: 'full'
    },
    {
        path: 'category',
        redirectTo: 'categories',
        pathMatch: 'full'
    },
    {
        path: 'categories/add',
        redirectTo: 'categories',
        pathMatch: 'full'
    },
    {
        path: 'categories/edit',
        redirectTo: 'categories',
        pathMatch: 'full'
    },
    {
        path: 'category/:id',
        redirectTo: 'categories',
        pathMatch: 'full'
    },
    {
        path: 'categories/:id',
        redirectTo: 'categories',
        pathMatch: 'full'
    },
    {
      path: '**',
      redirectTo: 'orders',
      pathMatch: 'full'
    }
];
