import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoryComponent } from './category/category.component';
import { OrdersComponent } from './orders/orders.component';
import { CustomersComponent } from './customers/customers.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { ProductsComponent } from './products/products.component';
import { LoginComponent } from './login/login.component';
import { AuthGuardGuard } from './shared';

export const appRoutes:Routes =[
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuardGuard]
    },
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
        path:'orders',
        component: OrdersComponent,
        canActivate: [AuthGuardGuard]
    },
    {
        path: 'customers',
        component: CustomersComponent,
        canActivate: [AuthGuardGuard]
    },
    {
        path: 'transactions',
        component: TransactionsComponent,
        canActivate: [AuthGuardGuard]
    },
    {
        path: 'reviews',
        component: ReviewsComponent,
        canActivate: [AuthGuardGuard]
    },
    {
        path: 'products',
        component: ProductsComponent,
        canActivate: [AuthGuardGuard]
    },
    {
        path: '',
        redirectTo:'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'category',
        redirectTo:'categories',
        pathMatch: 'full'
    },
    {
        path: 'category/:id/products',
        component: ProductsComponent
    },
    {
        path: 'categories/add',
        redirectTo:'categories',
        pathMatch: 'full'
    },
    {
        path: 'categories/edit',
        redirectTo:'categories',
        pathMatch: 'full'
    },
    {
        path: 'category/:id',
        redirectTo:'categories',
        pathMatch: 'full'
    },
    {
        path: 'categories/:id',
        redirectTo:'categories',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    }
]