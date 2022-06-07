import { Build } from 'express-ext';
import { Log, Manager, Search, SearchResult } from 'onecore';
import { DB, SearchBuilder } from 'query-core';
import { TemplateMap, useQuery } from 'query-mappers';
import { Appreciation, AppreciationFilter, AppreciationModel, AppreciationReply, AppreciationReplyFilter, AppreciationReplyModel, AppreciationReplyRepository, AppreciationReplyService, AppreciationRepository, AppreciationService, UsefulAppreciation, UsefulAppreciationFilter, UsefulAppreciationModel, UsefulAppreciationRepository } from './appreciation';
import { AppreciationController, AppreciationReplyController } from './appreciation-controller';
import { SqlAppreciationReplyRepository } from './appreciation-reply-repository';
export * from './appreciation-controller';
export { AppreciationController };

import { SqlAppreciationRepository } from './appreciation-repository';
import { SqlUsefulAppreciationRepository } from './appreciation-useful-repository';

export class AppreciationManager extends Manager<Appreciation, string, AppreciationFilter> implements AppreciationService {
  constructor(public searchAppreciation: Search<Appreciation, AppreciationFilter>, repository: AppreciationRepository, public useful: UsefulAppreciationRepository, public searchUseful: Search<UsefulAppreciation, UsefulAppreciationFilter>) {
    super(searchAppreciation, repository);
    this.usefulAppreciation = this.usefulAppreciation.bind(this)
    this.searchWithReply = this.searchWithReply.bind(this)
  }
  async usefulAppreciation(obj: UsefulAppreciation, generate: () => string): Promise<number> {
    const data = await this.searchUseful(obj)
    let isInsert = false
    if (data.list.length > 0) {
      const rs = await this.useful.delete(data.list[0].id)
      if (rs < 1)
        return 0
    } else {
      const newUseful = { ...obj, id: generate() }
      const rs = await this.useful.insert(newUseful)
      if (rs < 1)
        return rs
      isInsert = true;
    }
    const appreciation = await this.repository.load(obj.appreciationId)
    if (appreciation) {
      isInsert ? appreciation.usefulCount += 1 : appreciation.usefulCount -= 1;
      const rs = await this.repository.update(appreciation);
      if (rs === 1) {
        return isInsert ? 1 : 2;///1:insert
      }
    }
    return 0;
  }
  async searchWithReply(s: AppreciationFilter, userId?: string, limit?: number, offset?: string | number, fields?: string[]): Promise<SearchResult<Appreciation>> {
    const data = await this.searchAppreciation(s, limit, offset, fields)
    if (data.list.length == 0 || !userId) return data;
    let listAppreciation: Appreciation[] = data.list;
    for (const appreciation of listAppreciation) {
      const filter: UsefulAppreciationFilter = {
        appreciationId: appreciation.id,
        userId
      }
      const listUseful = await this.searchUseful(filter)
      if (listUseful.list.length > 0)
        appreciation.isUseful = true
    }
    data.list = listAppreciation
    return data;
  }
}
export function useAppreciationService(db: DB, mapper?: TemplateMap): AppreciationService {
  const query = useQuery('appreciation', mapper, AppreciationModel, true);
  const queryUseful = useQuery('usefulappreciation', mapper, UsefulAppreciationModel, true);
  const builder = new SearchBuilder<Appreciation, AppreciationFilter>(db.query, 'appreciation', AppreciationModel, db.driver, query);
  const builderUseful = new SearchBuilder<UsefulAppreciation, UsefulAppreciationFilter>(db.query, 'usefulappreciation', UsefulAppreciationModel, db.driver, queryUseful);
  const repository = new SqlAppreciationRepository(db);
  const useful = new SqlUsefulAppreciationRepository(db);
  return new AppreciationManager(builder.search, repository, useful, builderUseful.search);
}


//
export class AppreciationReplyManager extends Manager<AppreciationReply, string, AppreciationFilter> implements AppreciationReplyService {
  constructor(public searchAppreciation: Search<AppreciationReply, AppreciationReplyFilter>, public repositoryReply: AppreciationReplyRepository, public repository: AppreciationRepository, public useful: UsefulAppreciationRepository, public searchUseful: Search<UsefulAppreciation, UsefulAppreciationFilter>) {
    super(searchAppreciation, repositoryReply);
    this.usefulAppreciation = this.usefulAppreciation.bind(this)
    this.searchWithReply = this.searchWithReply.bind(this)
  }

  async usefulAppreciation(obj: UsefulAppreciation): Promise<number> {
    const data = await this.searchUseful(obj)
    let isInsert = false
    if (data.list.length > 0) {
      const rs = await this.useful.delete(data.list[0].id)
      if (rs < 1)
        return 0
    } else {
      const newUseful = { ...obj, id: Date.now().toString() }
      const rs = await this.useful.insert(newUseful)
      if (rs < 1)
        return rs
      isInsert = true;
    }
    const appreciation = await this.repository.load(obj.appreciationId)
    if (appreciation) {
      isInsert ? appreciation.usefulCount += 1 : appreciation.usefulCount -= 1;
      const rs = await this.repository.update(appreciation);
      if (rs === 1) {
        return isInsert ? 1 : 2;///1:insert
      }
    }
    return 0;
  }

  override async insert(obj: AppreciationReply, ctx?: any): Promise<number> {
    await this.repositoryReply.insert(obj)
    const rs = await this.repository.increaseReply(obj.appreciationId || '')
    return rs ? 1 : 0;
  }

  async searchWithReply(s: AppreciationFilter, userId?: string, limit?: number, offset?: string | number, fields?: string[]): Promise<SearchResult<Appreciation>> {
    const data = await this.searchAppreciation(s, limit, offset, fields)
    if (data.list.length == 0 || !userId) return data;
    let listAppreciation: Appreciation[] = data.list;
    for (const appreciation of listAppreciation) {
      const filter: UsefulAppreciationFilter = {
        appreciationId: appreciation.id,
        userId
      }
      const listUseful = await this.searchUseful(filter)
      if (listUseful.list.length > 0)
        appreciation.isUseful = true
    }
    data.list = listAppreciation
    return data;
  }
}
export function useAppreciationReplyService(db: DB, mapper?: TemplateMap): AppreciationReplyService {
  const query = useQuery('appreciationreply', mapper, AppreciationModel, true);
  const queryUseful = useQuery('usefulappreciation', mapper, UsefulAppreciationModel, true);
  const repositoryReply = new SqlAppreciationReplyRepository(db);
  const builder = new SearchBuilder<AppreciationReply, AppreciationReplyFilter>(db.query, 'appreciationreply', AppreciationReplyModel, db.driver, query);
  const builderUseful = new SearchBuilder<UsefulAppreciation, UsefulAppreciationFilter>(db.query, 'usefulappreciation', UsefulAppreciationModel, db.driver, queryUseful);
  const repository = new SqlAppreciationRepository(db);
  const useful = new SqlUsefulAppreciationRepository(db);
  return new AppreciationReplyManager(builder.search, repositoryReply, repository, useful, builderUseful.search);
}
//
export function useAppreciationController(log: Log, db: DB, generate: () => string, mapper?: TemplateMap, build?: Build<Appreciation>): AppreciationController {
  return new AppreciationController(log, useAppreciationService(db, mapper), generate, build);
}

export function useAppreciationReplyController(log: Log, db: DB, mapper?: TemplateMap, build?: Build<AppreciationReply>): AppreciationReplyController {
  return new AppreciationReplyController(log, useAppreciationReplyService(db, mapper), build);
}
