// 发送ajax请求
import baseUrl from '../env/env'
const cookie = wx.getStorageSync('cookies') ? JSON.parse(wx.getStorageSync('cookies')).MUSIC_U:''
const token = wx.getStorageSync('token') ? wx.getStorageSync('token'):''
export default (url,data={},method='GET')=>{
  return new Promise((resolve,reject)=>{
    //初始化promise实例的状态为pending
    wx.request({
        url:baseUrl + url,//请求地址
        data:data,//请求参数对象
        method:method,//请求方法
        header: {
          token,
          cookie
        },
        success:(res)=>{
        if(url=="/login/cellphone"){//登录请求判断路径就可以了
          wx.setStorage({
            key: 'cookies',
            data:JSON.stringify(res.cookies),
          })
        }
        resolve(res.data);
        },
        fail:(err)=>{
          reject(err);
        }
    })
  })
}