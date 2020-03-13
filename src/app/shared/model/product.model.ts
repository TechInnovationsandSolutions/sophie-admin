import { ICategory } from './category.model';
import { ITag } from './tag.model';

// import { ICategory } from './category.model';

export interface IReview{
    name: string,
    comment?: string,
    rating?:number,
    reviewDate?: Date
}

export interface IProdImage{
    url?:string
    thumbnail?:string,
}

export interface IProduct{
    id: number,
    name: string,
    category:ICategory,
    description:string,
    excerpt?:string,
    cost?:number,
    reduced_cost?:number,
    discount?:string,
    createdOn?:string,
    lastUpdate?:string,
    availibility?:string,
    ratings?:IReview[],
    tags?:ITag[],
    formTags?: string[],
    avg_rating?:number,
    images?: IProdImage[],
    quantity?: number
}