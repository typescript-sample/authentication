import { Build } from 'express-ext';
import { Log, Manager, Search, SearchResult } from 'onecore';
import { DB, SearchBuilder } from 'query-core';
import { TemplateMap, useQuery } from 'query-mappers';
import { Appreciation, AppreciationFilter, AppreciationModel, AppreciationReply, AppreciationReplyFilter, AppreciationReplyModel, AppreciationReplyRepository, AppreciationReplyService, AppreciationRepository, AppreciationService, UsefulAppreciation, UsefulAppreciationFilter, UsefulAppreciationModel, UsefulAppreciationRepository } from './appreciation';
import { SqlAppreciationReplyRepository } from './appreciation-reply-repository';
import { AppreciationController, AppreciationReplyController } from './item-appreciation-controller';
export * from './item-appreciation-controller';
export { AppreciationController };

import { SqlAppreciationRepository } from './appreciation-repository';
import { SqlUsefulAppreciationRepository } from './appreciation-useful-repository';

export class AppreciationManager extends Manager<Appreciation, string, AppreciationFilter> implements AppreciationService {
  constructor(public searchAppreciation: Search<Appreciation, AppreciationFilter>, repository: AppreciationRepository, public useful: UsefulAppreciationRepository, public searchUseful: Search<UsefulAppreciation, UsefulAppreciationFilter>) {
    super(searchAppreciation, repository);
    this.usefulAppreciation = this.usefulAppreciation.bind(this);
    this.searchWithReply = this.searchWithReply.bind(this);
  }

  async usefulAppreciation(obj: UsefulAppreciation): Promise<number> {
    const data = await this.searchUseful(obj);
    let isInsert = false;
    if (data.list.length > 0) {
      const rs = await this.useful.deleteUseful(data.list[0].appreciationId, data.list[0].userId);
      if (!rs) {
        return 0;
      }
    } else {
      const newUseful = { ...obj };
      const rs = await this.useful.insert(newUseful);
      if (rs < 1) {
        return rs;
      }
      isInsert = true;
    }
    const appreciation = await this.repository.load(obj.appreciationId);
    if (appreciation) {
      isInsert ? appreciation.usefulCount += 1 : appreciation.usefulCount -= 1;
      const rs = await this.repository.update(appreciation);
      if (rs === 1) {
        return isInsert ? 1 : 2; /// 1:insert
      }
    }
    return 0;
  }
  async searchWithReply(s: AppreciationFilter, userId?: string, limit?: number, offset?: string | number, fields?: string[]): Promise<SearchResult<Appreciation>> {
    const data = await this.searchAppreciation(s, limit, offset, fields);
    if (data.list.length === 0 || !userId) { return data; }
    const listAppreciation: Appreciation[] = data.list;
    for (const appreciation of listAppreciation) {
      const filter: UsefulAppreciationFilter = {
        appreciationId: appreciation.id,
        userId
      };
      const listUseful = await this.searchUseful(filter);
      if (listUseful.list.length > 0) {
        appreciation.isUseful = true;
      }
    }
    data.list = listAppreciation;
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
export class AppreciationReplyManager extends Manager<AppreciationReply, string, AppreciationReplyFilter> implements AppreciationReplyService {
  constructor(public searchAppreciation: Search<AppreciationReply, AppreciationReplyFilter>, public repositoryReply: AppreciationReplyRepository, public repositoryAppreciation: AppreciationRepository, public useful: UsefulAppreciationRepository, public searchUseful: Search<UsefulAppreciation, UsefulAppreciationFilter>) {
    super(searchAppreciation, repositoryReply);
    this.usefulAppreciation = this.usefulAppreciation.bind(this);
    this.searchWithReply = this.searchWithReply.bind(this);
  }

  async usefulAppreciation(obj: UsefulAppreciation): Promise<number> {
    const data = await this.searchUseful(obj);
    let isInsert = false;
    if (data.list.length > 0) {
      const rs = await this.useful.deleteUseful(data.list[0].appreciationId, data.list[0].userId);
      if (!rs) {
        return 0;
      }
    } else {
      const newUseful = { ...obj };
      const rs = await this.useful.insert(newUseful);
      if (rs < 1) {
        return rs;
      }
      isInsert = true;
    }
    const appreciation = await this.repositoryReply.load(obj.appreciationId);
    if (appreciation) {
      isInsert ? appreciation.usefulCount += 1 : appreciation.usefulCount -= 1;
      const rs = await this.repositoryReply.update(appreciation);
      if (rs === 1) {
        return isInsert ? 1 : 2; /// 1:insert
      }
    }
    return 0;
  }

  override async insert(obj: AppreciationReply, ctx?: any): Promise<number> {
    await this.repositoryReply.insert(obj);
    const rs = await this.repositoryAppreciation.increaseReply(obj.appreciationId || '', 1);
    return rs ? 1 : 0;
  }

  async searchWithReply(s: AppreciationFilter, userId?: string, limit?: number, offset?: string | number, fields?: string[]): Promise<SearchResult<Appreciation>> {
    const data = await this.searchAppreciation(s, limit, offset, fields);
    if (data.list.length === 0 || !userId) { return data; }
    const listAppreciation: AppreciationReply[] = data.list;
    for (const appreciation of listAppreciation) {
      const filter: UsefulAppreciationFilter = {
        appreciationId: appreciation.id,
        userId
      };
      const listUseful = await this.searchUseful(filter);
      if (listUseful.list.length > 0) {
        appreciation.isUseful = true;
      }
    }
    data.list = listAppreciation;
    return data;
  }

  override async delete(id: string, ctx?: any): Promise<number> {
    const appreciationReply = await this.repositoryReply.load(id);
    if (!appreciationReply) { return 0; }
    await this.repositoryReply.delete(id);
    const rs = await this.repositoryAppreciation.increaseReply(appreciationReply.appreciationId || '', -1);
    return rs ? 1 : 0;
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
export function useAppreciationController(log: Log, db: DB, mapper?: TemplateMap, build?: Build<Appreciation>): AppreciationController {
  return new AppreciationController(log, useAppreciationService(db, mapper), build);
}

export function useAppreciationReplyController(log: Log, db: DB, mapper?: TemplateMap, build?: Build<AppreciationReply>): AppreciationReplyController {
  return new AppreciationReplyController(log, useAppreciationReplyService(db, mapper), build);
}
