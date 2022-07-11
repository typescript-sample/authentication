import { Log, Manager, Search } from 'onecore';
import { DB, postgres, SearchBuilder } from 'query-core';
import { buildQuery } from './query';
import { Item, ItemFilter, ItemModel, ItemRepository, ItemService } from './item';
import { ItemController } from './item-controller';
export * from './item';

export { ItemController };

import { SqlItemRepository } from './sql-item-repository';

export class ItemManager extends Manager<Item, string, ItemFilter> implements ItemService {
  constructor(search: Search<Item, ItemFilter>, repository: ItemRepository) {
    super(search, repository);
  }
}
export function useItemService(db: DB): ItemService {
  const builder = new SearchBuilder<Item, ItemFilter>(db.query, 'items', ItemModel, postgres, buildQuery);
  const repository = new SqlItemRepository(db);
  return new ItemManager(builder.search, repository);
}
export function useItemController(log: Log, db: DB): ItemController {
  return new ItemController(log, useItemService(db));
}
