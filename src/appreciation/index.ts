import { Log, Manager, Search } from 'onecore';
import { DB, SearchBuilder } from 'query-core';
import { Appreciation, AppreciationFilter, AppreciationModel, AppreciationRepository, AppreciationService } from './appreciation';
import { AppreciationController } from './appreciation-controller';
import { TemplateMap, useQuery } from 'query-mappers';
export * from './appreciation-controller';
export { AppreciationController };

import { SqlAppreciationRepository } from './appreciation-repository';

export class AppreciationManager extends Manager<Appreciation, string, AppreciationFilter> implements AppreciationService {
  constructor(search: Search<Appreciation, AppreciationFilter>, repository: AppreciationRepository) {
    super(search, repository);
  }

  test(obj: Appreciation, ctx?: any): Promise<number> {
    return new Promise(()=>1);
    // return this.repository.insert(obj, ctx);
  }

}
export function useAppreciationService(db: DB, mapper?: TemplateMap): AppreciationService {
  const query = useQuery('appreciation', mapper, AppreciationModel, true);
  const builder = new SearchBuilder<Appreciation, AppreciationFilter>(db.query, 'appreciation', AppreciationModel, db.driver, query);
  const repository = new SqlAppreciationRepository(db);
  return new AppreciationManager(builder.search, repository);
}
export function useAppreciationController(log: Log, db: DB, mapper?: TemplateMap): AppreciationController {
  return new AppreciationController(log, useAppreciationService(db, mapper));
}
