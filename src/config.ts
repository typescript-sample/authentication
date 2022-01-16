export const config = {
  port: 8082,
  secure: false,
  allow: {
    origin: 'http://localhost:3001',
    credentials: 'true',
    methods: 'GET,PUT,POST,DELETE,OPTIONS,PATCH',
    headers: 'Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
  },
  log: {
    level: 'info',
    map: {
      time: '@timestamp',
      msg: 'message'
    }
  },
  middleware: {
    log: true,
    skips: 'health,log,authenticate',
    request: 'request',
    status: 'status',
    size: 'size'
  },
  mongo: {
    uri: 'mongodb://localhost:27017',
    db: 'authentication'
  },
  auth: {
    token: {
      secret: 'secretbackoffice',
      expires: 86400000
    },
    status: {
      success: 1
    },
    lockedMinutes: 1,
    maxPasswordFailed: 3,
    payload: {
      id: 'id',
      username: 'username',
      email: 'email',
      userType: 'userType'
    },
    account: {
      displayName: 'displayname'
    },
    userStatus: {
      activated: 'A',
      deactivated: 'D'
    },
    db: {
      user: 'user',
      password: 'authentication',
      username: 'username',
      status: 'status',
      successTime: 'successTime',
      failTime: 'failTime',
      failCount: 'failCount',
      lockedUntilTime: 'lockedUntilTime'
    }
  }
};

export const env = {
  sit: {
    mongo: {
      db: 'masterdata_sit',
    }
  },
  prd: {
    log: {
      level: 'error'
    },
    middleware: {
      log: false
    }
  }
};
