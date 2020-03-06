// import { ICategory } from './category.model';

export interface IReview{
    name: string,
    comment?: string,
    rating?:number,
    reviewDate?: Date
}

export interface IProdImage{
    url:string
}

export interface IProduct{
    id: number,
    name: string,
    category:string,
    description:string,
    excerpts:string,
    cost:string,
    reduced_cost?:string,
    discount?:string,
    createdOn:string,
    lastUpdate?:string,
    availibility?:string,
    ratings?:IReview[],
    tag?:string[],
    avg_rating?:number,
    images: IProdImage[]
}