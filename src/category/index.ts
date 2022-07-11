
import { Log } from "express-ext";
import { Manager, Mapper, Search } from "onecore";
import { DB, SearchBuilder } from "query-core";
import { TemplateMap, useQuery } from "query-mappers";
import { Category, CategoryFilter, categoryModel, CategoryRepository, CategoryService } from "./category";
import { CategoryController } from "./category-controller";
import { SqlCategoryRepositoy } from "./sql-category-repository";

export { CategoryController };

export class CategoryManager extends Manager<Category, string, CategoryFilter> implements CategoryService{
  constructor(search: Search<Category, CategoryFilter>, repository: CategoryRepository) {
    super(search, repository);
  }
}
export function useCategoryService(db: DB, mapper?: TemplateMap): CategoryService {
  const query = useQuery('categories', mapper, categoryModel, true);
  const builder = new SearchBuilder<Category, CategoryFilter>(db.query, 'categories', categoryModel, db.driver,query);
  const repository = new SqlCategoryRepositoy(db);
  return new CategoryManager(builder.search, repository);
  
}
export function useCategoryController(log: Log, db: DB, mapper?: TemplateMap): CategoryController {
  return new CategoryController(log, useCategoryService(db, mapper));
}
