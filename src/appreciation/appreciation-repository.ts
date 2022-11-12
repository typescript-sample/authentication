import { DB, Repository, Statement } from 'query-core';
import { Appreciation, AppreciationModel, AppreciationReply, AppreciationRepository } from './appreciation';

export class SqlAppreciationRepository extends Repository<Appreciation, string> implements AppreciationRepository {
  constructor(db: DB) {
    super(db, 'appreciation', AppreciationModel);
  }

  async increaseReply(id: string, count: number): Promise<boolean> {
    try {
      const query = `update appreciation set replycount = replycount +${count} where id=$1`;
      const rs = await this.exec(query, [id]);
      return rs > 0;
    } catch (error) {
      return false;
    }
  }

  async delete(id: string, ctx?: any): Promise<number> {
    try {
      const stmts: Statement[] = [];
      const q = 'select * from appreciationreply where appreciationid = $1';
      const list: AppreciationReply[] = await this.query(q, [id], this.map);
      if (list.length > 0) {
        for (const appreciationReply of list) {
          const queryDeleteAppreciationReplyUseful = `delete from usefulappreciation where appreciationid = $1`;
          stmts.push({ query: queryDeleteAppreciationReplyUseful, params: [appreciationReply.id] });
        }
      }
      const queryDeleteAppreciationUseful = `delete from usefulappreciation where appreciationid = $1`;
      const queryDeleteAppreciation = `delete from appreciation where id = $1`;
      const queryDeleteAppreciationReplyRef = `delete from appreciationreply where appreciationid = $1`;
      stmts.push({ query: queryDeleteAppreciationUseful, params: [id] });
      stmts.push({ query: queryDeleteAppreciationReplyRef, params: [id] });
      stmts.push({ query: queryDeleteAppreciation, params: [id] });
      const rs = await this.execBatch(stmts, false);
      return rs;
    } catch (error) {
      return 0;
    }
  }
}
