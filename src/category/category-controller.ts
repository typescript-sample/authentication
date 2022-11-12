import { Controller, Log } from 'express-ext';
import { Category, CategoryFilter, CategoryService } from './category';

export class CategoryController extends Controller<
  Category,
  string,
  CategoryFilter
> {
  constructor(log: Log, categoryService: CategoryService) {
    super(log, categoryService);
    this.array = ['status'];
  }
}
