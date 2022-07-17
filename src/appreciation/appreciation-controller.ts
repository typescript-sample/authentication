import { Request, Response } from 'express';
import { Build, buildArray, Controller, format, fromRequest, getParameters, handleError, jsonResult, Log } from 'express-ext';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { Appreciation, AppreciationFilter, AppreciationReply, AppreciationReplyFilter, AppreciationReplyService, AppreciationService, UsefulAppreciation, UsefulAppreciationFilter } from './appreciation';
export class AppreciationController extends Controller<Appreciation, string, AppreciationFilter> {
  constructor(log: Log, public userService: AppreciationService, build?: Build<Appreciation>) {
    super(log, userService, undefined, build);
    this.usefulAppreciation = this.usefulAppreciation.bind(this);
    this.search = this.search.bind(this);
  }

  usefulAppreciation(req: Request, res: Response) {
    const { appreciationId, userId } = req.body;
    if (appreciationId && userId) {
      const useful: UsefulAppreciationFilter = {
        appreciationId, userId
      };
      return this.userService.usefulAppreciation(useful).then(
        rs => {
          if (rs > 0) {
            res.status(200).json(rs).end();
          } else {
            res.status(500).json(rs).end();
          }
        }
      );
    } else {
      return res.status(400).end('data cannot be empty');
    }
  }

  search(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>): void {
    const s = fromRequest<AppreciationFilter>(req, buildArray(this.array, this.fields, this.excluding));
    const l = getParameters(s, this.config);
    const s2 = format(s, this.dates, this.numbers);
    this.userService.searchWithReply(s2, req.query.userIdUseful?.toString(), l.limit, l.skipOrRefId, l.fields)
      .then(result => jsonResult(res, result, this.csv, l.fields, this.config))
      .catch(err => handleError(err, res, this.log));
  }
}

export class AppreciationReplyController extends Controller<AppreciationReply, string, AppreciationReplyFilter> {
  constructor(log: Log, public serviceAppreciation: AppreciationReplyService, build?: Build<AppreciationReply>) {
    super(log, serviceAppreciation, undefined, build);
    this.create = this.create.bind(this);
    this.usefulAppreciation = this.usefulAppreciation.bind(this);
    this.search = this.search.bind(this);
  }

  usefulAppreciation(req: Request, res: Response) {
    const { appreciationId, userId } = req.body;
    if (appreciationId && userId) {
      const useful: UsefulAppreciationFilter = {
        appreciationId, userId
      };
      return this.serviceAppreciation.usefulAppreciation(useful).then(
        rs => {
          if (rs > 0) {
            res.status(200).json(rs).end();
          } else {
            res.status(500).json(rs).end();
          }
        }
      );
    } else {
      return res.status(400).end('data cannot be empty');
    }
  }
  search(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>): void {
    const s = fromRequest<AppreciationReplyFilter>(req, buildArray(this.array, this.fields, this.excluding));
    const l = getParameters(s, this.config);
    const s2 = format(s, this.dates, this.numbers);
    this.serviceAppreciation.searchWithReply(s2, req.query.userIdUseful?.toString(), l.limit, l.skipOrRefId, l.fields)
      .then(result => jsonResult(res, result, this.csv, l.fields, this.config))
      .catch(err => handleError(err, res, this.log));
  }
}
