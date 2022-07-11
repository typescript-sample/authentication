import { Attributes, Filter, Service } from 'onecore';
import { Repository } from 'query-core';

export interface CategoryFilter extends Filter {
  id?: string;
  categoryName?: string;
  status?:string;
}
export interface Category {
  categoryId: string;
  categoryName: string;
  status:string;
}
export interface CategoryRepository extends Repository<Category, string>{

}
export interface CategoryService extends Service<Category, string, CategoryFilter> {

}

export const categoryModel: Attributes = {
  categoryId: {
    key: true,
    length: 40,
    q:true,
  },
  categoryName: {
    required: true,
    length: 300,
    q:true
  },
  status: {
    match: 'equal',
    length: 1
  },
  createdBy: {},
  createdAt: {
    type: 'datetime'
  },
  updatedBy: {},
  updatedAt: {
    type: 'datetime'
  },
};
