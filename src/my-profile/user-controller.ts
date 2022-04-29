import { Request, Response } from 'express';
import { buildAndCheckId, handleError, minimize, respondModel } from 'express-ext';
import { Log } from 'onecore';
import { UserSettings } from '../my-profile';
import { UploadController } from 'upload-express';
import { MyProfileService } from './user';

export class MyProfileController extends UploadController {
  constructor(
    log: Log,
    private service: MyProfileService,
    generateId: () => string
  ) {
    super(log, service, service.getGalllery, generateId, 'id');
    this.getMyProfile = this.getMyProfile.bind(this);
    this.getMySettings = this.getMySettings.bind(this);
    this.saveMyProfile = this.saveMyProfile.bind(this);
    this.saveMySettings = this.saveMySettings.bind(this);
  }
  getMyProfile(req: Request, res: Response) {
    const id = buildAndCheckId<string>(req, res);
    if (id) {
      this.service
        .getMyProfile(id)
        .then((user) => respondModel(minimize(user), res))
        .catch((err) => handleError(err, res, this.log));
    }
  }
  getMySettings(req: Request, res: Response) {
    const id = req.params['id'];
    if (!id || id.length === 0) {
      res.status(400).end('id cannot be empty');
    } else {
      this.service
        .getMySettings(id)
        .then((settings) => respondModel(minimize(settings), res))
        .catch((err) => handleError(err, res, this.log));
    }
  }
  saveMyProfile(req: Request, res: Response) {
    const data = req.body;
    if (!data) {
      res.status(400).end('data cannot be empty');
    } else {
      this.service
        .saveMyProfile(data)
        .then((user) => {
          if (user) {
            res.status(200).json(user).end();
          } else {
            res.status(404).json(null).end();
          }
        })
        .catch((err) => handleError(err, res, this.log));
    }
  }
  saveMySettings(req: Request, res: Response) {
    const id = req.params['id'];
    if (!id || id.length === 0) {
      res.status(400).end('id cannot be empty');
    } else {
      const settings: UserSettings = req.body;
      if (!settings) {
        res.status(400).end('data cannot be empty');
      } else {
        this.service
          .saveMySettings(id, settings)
          .then((user) => {
            if (user) {
              res.status(200).json(user);
            } else {
              res.status(404).json(null);
            }
          })
          .catch((err) => handleError(err, res, this.log));
      }
    }
  }
}
