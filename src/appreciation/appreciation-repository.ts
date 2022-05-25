import { DB, Repository } from 'query-core';
import { Appreciation, AppreciationModel, AppreciationRepository } from './appreciation';

export class SqlAppreciationRepository extends Repository<Appreciation, string> implements AppreciationRepository {
  constructor(db: DB) {
    super(db, 'appreciation', AppreciationModel);
  }
}
