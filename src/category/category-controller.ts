import { Controller, handleError, Log, queryParam } from "express-ext";
import { Request, Response } from "express";
import { Category, CategoryFilter, CategoryService } from "./category";

export class CategoryController extends Controller<
  Category,
  string,
  CategoryFilter
> {
  constructor(log: Log, private categoryService: CategoryService) {
    super(log, categoryService);
    this.array = ["status"];
    // this.all = this.all.bind(this);
  }
  // all(req: Request, res: Response) {
  //   const v = req.query["categoryName"];
  //   if (v && v.toString()) {
  //   } else {
  //     if (this.categoryService.all) {
  //       this.categoryService
  //         .all()
  //         .then((categories) => res.status(200).json(categories))
  //         .catch((err) => handleError(err, res, this.log));
  //     }
  //   }
  // }
}
