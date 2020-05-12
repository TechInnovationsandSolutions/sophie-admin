import { ICustomer } from './customer.model';

export interface IUSerAddress {
  id: number;
  first_name: string;
  last_name: string;
  state_id: number;
  lga_id: number;
  city: string;
  address: string;
  phone: string;
}

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
  reference?: number;
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
  address: IUSerAddress;
  cost: string;
  created_at: string;
  deleted_at: string;
  items: IOrderItem[];
  quantity: number;
  status: number;
  payment: IOrderPayment;
  user: ICustomer;
}
