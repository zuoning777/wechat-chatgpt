const { WechatyBuilder } = require('wechaty');
const { receiveMsg } = require('./utils/message');
const { onScan, onLogin, onLogout, onError } = require('./utils/login');

const wechaty = WechatyBuilder.build();
wechaty
  .on('scan', onScan)
  .on('login', onLogin)
  .on('message', receiveMsg)
  .on('error', onError)
  .on('logout', onLogout);

wechaty.start();
