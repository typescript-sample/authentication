import { Request, Response } from 'express';
import { buildAndCheckId, handleError, minimize, respondModel } from 'express-ext';
import { UserSettings } from 'my-profile';
import { Log } from 'onecore';
import { MyProfileService, UploadInfo } from './user';

export class MyProfileController {
  constructor(private log: Log, private service: MyProfileService) {
    this.getMyProfile = this.getMyProfile.bind(this);
    this.getMySettings = this.getMySettings.bind(this);
    this.saveMyProfile = this.saveMyProfile.bind(this);
    this.saveMySettings = this.saveMySettings.bind(this);
    this.upload = this.upload.bind(this);
    this.delete = this.delete.bind(this);
    this.fetchImageUploaded = this.fetchImageUploaded.bind(this)
  }
  getMyProfile(req: Request, res: Response) {
    const id = buildAndCheckId<string>(req, res);
    if (id) {
      this.service.getMyProfile(id)
        .then(user => respondModel(minimize(user), res))
        .catch(err => handleError(err, res, this.log));
    }
  }
  getMySettings(req: Request, res: Response) {
    const id = req.params['id'];
    if (!id || id.length === 0) {
      res.status(400).send('id cannot be empty');
    } else {
      this.service.getMySettings(id)
        .then(settings => {
          if (settings) {
            res.status(200).json(settings);
          } else {
            res.status(404).json(null);
          }
        })
        .catch(err => handleError(err, res, this.log));
    }
  }
  saveMyProfile(req: Request, res: Response) {
    const data = req.body;
    if (!data) {
      res.status(400).send('data cannot be empty');
    } else {
      this.service.saveMyProfile(data)
        .then(user => {
          if (user) {
            res.status(200).json(user);
          } else {
            res.status(404).json(null);
          }
        })
        .catch(err => handleError(err, res, this.log));
    }
  }
  saveMySettings(req: Request, res: Response) {
    const id = req.params['id'];
    if (!id || id.length === 0) {
      res.status(400).send('id cannot be empty');
    } else {
      const settings: UserSettings = req.body;
      if (!settings) {
        res.status(400).send('data cannot be empty');
      } else {
        this.service.saveMySettings(id, settings)
          .then(user => {
            if (user) {
              res.status(200).json(user);
            } else {
              res.status(404).json(null);
            }
          })
          .catch(err => handleError(err, res, this.log));
      }
    }
  }

  upload(req: Request, res: Response) {
    if (!req || !req.file) return
    const fileName = req.file.originalname;
    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;
    const type = fileType.split('/')[0];
    const { id, source } = req.body;
    const name = `${id.toString()}_` + fileName;
    const uploadInfo: UploadInfo = {
      id, source, type, name, fileBuffer
    }
    if (!uploadInfo) {
      res.status(400).send('data cannot be empty');
    } else {
      this.service.uploadFile(uploadInfo).then(result =>
        res.status(200).json(result)
      ).
        catch(e => handleError(e, res, this.log));
    }
  }
  delete(req: Request, res: Response) {
    const filename = req.body.filename
    if (!filename) { 
      res.status(400).send('data cannot be empty');
    } else {
      this.service.deleteFile(filename).then(rs => {
        if (rs)
          res.status(200).json(rs)
        else {
          res.status(404).json(null);
        }
      }
      ).catch(err => handleError(err, res, this.log))
    }
  }
  fetchImageUploaded(req: Request, res: Response) {
    const id = buildAndCheckId<string>(req, res);
    if (id) {
      this.service.getMyProfile(id)
        .then(user => respondModel(minimize(user?.uploadCover), res))
        .catch(err => handleError(err, res, this.log));
    }
  }
}
