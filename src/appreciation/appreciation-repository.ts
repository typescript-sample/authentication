import { DB, Repository } from 'query-core';
import { Appreciation, AppreciationModel, AppreciationRepository } from './appreciation';

export class SqlAppreciationRepository extends Repository<Appreciation, string> implements AppreciationRepository {
  constructor(db: DB) {
    super(db, 'appreciation', AppreciationModel);
  }

  async increaseReply(id: string): Promise<boolean> {
    try {
      const query = 'update appreciation set replycount = replycount +1 where id=$1';
      const rs = await this.exec(query, [id])
      return rs > 0;
    } catch (error) {
      console.log(error)
      return false
    }
  }
}
