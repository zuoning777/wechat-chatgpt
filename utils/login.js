const { ScanStatus } = require('wechaty');
const qrcode = require('qrcode-terminal');

const onScan = (code, status) => {
  // status: 2代表等待，3代表扫码完成
  status === ScanStatus.Waiting && qrcode.generate(code, { small: true }, console.log);
};

const onLogout = (user) => {
  console.log(`用户 ${user} 退出成功`);
};
const onLogin = (user) => {
  console.log(`用户 ${user} 登录成功`);
};

const onError = console.error;

module.exports = {
  onScan,
  onLogin,
  onLogout,
  onError
};
