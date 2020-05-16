import { ICustomer, ICustomerAddress } from './customer.model';

export interface IOrderImage {
  thumbnail: string;
  url: string;
}

export interface IOrderPayment {
  access_code?: string;
  amount?: number;
  created_at?: Date;
  deleted_at?: Date;
  id?: number;
  order_id?: number;
  reference?: string;
  status?: boolean;
  updated_at?: Date;
}

export interface IOrderItem {
  amount: number;
  product_id?: number;
  id: number;
  images: IOrderImage[];
  product: string;
  quantity: number;
}

export interface IOrder {
  id: number;
  address: ICustomerAddress;
  cost: number;
  created_at: string;
  deleted_at: string;
  items: IOrderItem[];
  quantity: number;
  status: number;
  payment: IOrderPayment;
  user: ICustomer;
}

export interface IOrderDatestamp {
  order: IOrder;
  day?: string;
  week?: number;
  month?: string;
  year?: number;
}

export interface IOrderSort {
  criteria: string;
  totAmt: number;
  orders: IOrderDatestamp[];
}
