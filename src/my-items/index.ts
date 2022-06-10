import { Log, Manager, Search } from 'onecore';
import { DB, postgres, SearchBuilder } from 'query-core';
import { TemplateMap, useQuery } from 'query-mappers';
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
  export function useItemService(db: DB, mapper?: TemplateMap): ItemService {
    const query = useQuery('item', mapper, ItemModel, true);
    const builder = new SearchBuilder<Item, ItemFilter>(db.query, 'items', ItemModel, postgres, query);
    const repository = new SqlItemRepository(db);
    return new ItemManager(builder.search, repository);
}
  export function useItemController(log: Log, db: DB, mapper?: TemplateMap): ItemController {
    return new ItemController(log, useItemService(db, mapper));
}
