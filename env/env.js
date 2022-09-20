const Hosts = {
  //开发环境
  Dev:{
    "BaseUrl":"http://192.168.31.26:3000"
  },
  //测试环境
  Test:{
    "BaseUrl":"https://www.baidu.com"
  },
  //生产环境
  Prod:{
    "BaseUrl": "https://www.baidu.com"
  }
};
const { envVersion } = wx.getAccountInfoSync().miniProgram;
let baseUrl = "";
switch (envVersion) {
  case 'develop':
      baseUrl = Hosts.Dev.BaseUrl;
      break;
  case 'trial':
      baseUrl = Hosts.Test.BaseUrl;
      break;
  case 'release':
      baseUrl = Hosts.Prod.BaseUrl;
      break;
  default:
      baseUrl = Hosts.Prod.BaseUrl;
      break;
}
export default baseUrl;
