export interface ICustomerAddress {
  id: number;
  first_name: string;
  last_name: string;
  state_id: number;
  lga_id: number;
  city: string;
  address: string;
  phone: string;
}

export interface ICustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified_at: string;
  phone: string;
  address: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: string;
}
