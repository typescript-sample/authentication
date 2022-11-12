import { DB, Repository, Statement } from 'query-core';
import { AppreciationReply, AppreciationReplyModel, AppreciationReplyRepository } from './appreciation';

export class SqlAppreciationReplyRepository extends Repository<AppreciationReply, string> implements AppreciationReplyRepository {
  constructor(db: DB) {
    super(db, 'appreciationreply', AppreciationReplyModel);
  }

  async increaseReply(id: string): Promise<boolean> {
    try {
      const query = 'update appreciationreply set replycount = replycount +1 where id=$1';
      const rs = await this.exec(query, [id]);
      return rs > 0;
    } catch (error) {
      return false;
    }
  }
  async delete(id: string, ctx?: any): Promise<number> {
    try {
      const stmts: Statement[] = [];
      const queryDeleteAppreciationReplyUseful = `delete from usefulappreciation where appreciationid = $1`;
      const queryDeleteAppreciationReply = `delete from appreciationreply where id = $1`;
      stmts.push({ query: queryDeleteAppreciationReplyUseful, params: [id] });
      stmts.push({ query: queryDeleteAppreciationReply, params: [id] });
      const rs = await this.execBatch(stmts, false);
      return rs;
    } catch (error) {
      return 0;
    }
  }
}
