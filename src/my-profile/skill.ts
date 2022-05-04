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
