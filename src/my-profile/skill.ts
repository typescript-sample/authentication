import { Statement } from "pg-extension";

export class SkillService {
  constructor(public table:string, public field:string, protected query: <T>( sql: string, args?: any[]) => Promise<T[]>, protected execBatch: (statements: Statement[], firstSuccess?: boolean, ctx?: any) => Promise<number>) {
    this.load = this.load.bind(this);
    this.save = this.save.bind(this);
  }
  load(keyword: string, max?: number): Promise<string[]> {
    const m = (max && max > 0 ? max : 20);
    const k = keyword + '%';
    return this.query(`select ${this.field} from ${this.table} where ${this.field} ilike $1 order by ${this.field} limit ${m}`, [k]).then(res => res.map(i => (i as any)[this.field]));
  }
  save(skills: string[]): Promise<number> {
    const s = buildStatements(skills,this.table,this.field);
    return this.execBatch(s);
  }
}

function buildStatements(skills: string[], table: string, field:string): Statement[] {
  const s: Statement[] = [];
  for (const skill of skills) {
    const query = `insert into ${table}(${field}) values ( $1 ) on conflict(${field}) do nothing`;
    const s0 = {query, params: [skill]}
    s.push(s0)
  }
  return s;
}
