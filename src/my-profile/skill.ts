import {Request, Response} from 'express';
import { handleError, minimize, respondModel } from 'express-ext';

interface Skill {
  skill: string;
}
export class SkillService {
  constructor(protected query: <T>(sql: string, args?: any[]) => Promise<T[]>) {
    this.load = this.load.bind(this);
  }
  load(keyword: string, max?: number): Promise<string[]> {
    const m = (max && max > 0 ? max : 20);
    const k = keyword + '%';
    return this.query<Skill>(`select skill from skills where skill ilike $1 order by skill limit ${m}`, [k]).then(res => res.map(i => i.skill));
  }
}
type Log = (msg: string) => void;
// tslint:disable-next-line:max-classes-per-file
export class QueryController<T> {
  constructor(protected log: Log, private loadData: (keyword: string, max?: number) => Promise<T>, name?: string, protected param?: boolean, max?: number, maxName?: string) {
    this.name = (name && name.length > 0 ? name : 'keyword');
    this.max = (max && max > 0 ? max : 20);
    this.maxName = (maxName && maxName.length > 0 ? maxName : 'max');
    this.load = this.load.bind(this);
    this.query = this.query.bind(this);
  }
  name: string;
  max: number;
  maxName: string;
  query(req: Request, res: Response) {
    return this.load(req, res);
  }
  load(req: Request, res: Response) {
    const v = this.param ? req.params[this.name] : req.query[this.name];
    if (!v) {
      res.status(400).end(`'${this.name}' cannot be empty`);
    } else {
      const s = v.toString();
      if (s.length === 0) {
        res.status(400).end(`'${this.name}' cannot be empty`);
      } else {
        const max = queryNumber(req, this.maxName, this.max);
        this.loadData(s, max)
          .then(result => respondModel(minimize(result), res))
          .catch(err => handleError(err, res, this.log));
      }
    }
  }
}
export function queryNumber(req: Request, name: string, d: number): number {
  const field = req.query[name];
  const v = field ? field.toString() : undefined;
  if (!v || v.length === 0) {
    return d;
  }
  if (isNaN(v as any)) {
    return d;
  }
  const n = parseFloat(v);
  return n;
}
