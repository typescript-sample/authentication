import { DB, Repository } from 'query-core';
import { UsefulAppreciation, UsefulAppreciationModel, UsefulAppreciationRepository } from './appreciation';

export class SqlUsefulAppreciationRepository extends Repository<UsefulAppreciation, string> implements UsefulAppreciationRepository {
  constructor(db: DB) {
    super(db, 'usefulappreciation', UsefulAppreciationModel);
  }

  async deleteUseful(appreciationId: string, userId: string, ctx?: any): Promise<boolean> {
    try {
      const query = 'delete from usefulappreciation where appreciationid = $1 and userid = $2';
      const rs = await this.exec(query, [appreciationId, userId]);
      return rs > 0;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
