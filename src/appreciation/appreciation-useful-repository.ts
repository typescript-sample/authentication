import { DB, Repository } from 'query-core';
import { UsefulAppreciation, UsefulAppreciationModel, UsefulAppreciationRepository } from './appreciation';

export class SqlUsefulAppreciationRepository extends Repository<UsefulAppreciation, string> implements UsefulAppreciationRepository {
  constructor(db: DB) {
    super(db, 'usefulappreciation', UsefulAppreciationModel);
    // this.
  }
}
