import { IProduct } from './product.model';

export interface ProductResponse {
    count?: number;
    total?: number;
    prev?: null;
    next?: string;
    pg?: any [];
    data: IProduct[];
}
