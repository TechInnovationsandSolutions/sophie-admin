import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoryComponent } from './category/category.component';
import { OrdersComponent } from './orders/orders.component';
import { CustomersComponent } from './customers/customers.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { ProductsComponent } from './products/products.component';

export const appRoutes:Routes =[
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'categories',
        component: CategoryComponent
    },
    {
        path:'orders',
        component: OrdersComponent
    },
    {
        path: 'customers',
        component: CustomersComponent
    },
    {
        path: 'transactions',
        component: TransactionsComponent
    },
    {
        path: 'reviews',
        component: ReviewsComponent
    },
    {
        path: 'products',
        component: ProductsComponent
    },
    {
        path: '',
        redirectTo:'dashboard',
        pathMatch: 'full'
    }
]