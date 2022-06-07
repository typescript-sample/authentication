import { DB, Repository } from 'query-core';
import { AppreciationReply, AppreciationReplyModel, AppreciationReplyRepository } from './appreciation';

export class SqlAppreciationReplyRepository extends Repository<AppreciationReply, string> implements AppreciationReplyRepository {
  constructor(db: DB) {
    super(db, 'appreciationreply', AppreciationReplyModel);
  }


  async increaseReply(id: string): Promise<boolean> {
    try {
      const query = 'update appreciationreply set replycount = replycount +1 where id=$1';
      const rs = await this.exec(query, [id])
      return rs > 0;
    } catch (error) {
      console.log(error)
      return false
    }
  }
}
``