// pages/index/index.js
import { formatNumber } from '../../utils/formatNumber'
//获取应用实例
const app = getApp();
let timer = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList:[], //轮播图
    recommendList:[],//推荐歌单数据
    topList:[],//排行榜数据
    searchDetailList:[],
    placeholder:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 请求的方法均统一管理，页面只负责传参和接收结果
    app.$API.getHomeBanner().then((res)=>{
      this.setData({ bannerList: res.banners }) 
    })
    // 格式化播放量
    const formatPlayCount = (list) => {
      list.result.forEach((item) => {
        let countTemp = formatNumber(item.playCount)
        item.playCount = countTemp
      })
    }
    // 推荐列表
    app.$API.getHomePersonalized().then((res)=>{
      formatPlayCount(res)
      this.setData({ recommendList: res.result })
    })
    // 榜单,限制变量的作用域
    const getTopMusicList = async() => {
      //排行榜数据
      let listId = [19723756,3779629,3778678,2250011882]
      let temp = []
      for(let i = 0;i<listId.length;i++){
        let arr = await app.$API.getHomeTopPlaylist({id:listId[i]})
        arr.playlist.tracks = arr.playlist.tracks.slice(0, 3) //只要三条数据
        temp.push(arr.playlist)
        this.setData({ topList: temp })
      }
      // this.setData({ topList: temp })
    }
    // 获取榜单
    getTopMusicList()
    // 获取搜索数据,并启动定时器
    this.getSearchDetailList()
  },
  //跳转到搜索页面
  toSearch(){
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  //跳转到每日推荐歌曲页面
  toRecommendSong(){
    wx.navigateTo({
      url: '/songPackage/pages/recommendSong/recommendSong',
    })
  },
  toSongDetail(event){
    wx.navigateTo({
      url: '/songPackage/pages/songDetail/songDetail?song=' + event.currentTarget.id
    })
  },
  //跳转到歌单歌曲列表页面
  toPlayList(event){
    wx.navigateTo({
      url: '/songPackage/pages/playlist/playlist?id=' + event.currentTarget.id
    })
  },
  getSearchDetailList() {
    app.$API.reqSearchDetailList().then((result) => {
      this.setData({searchDetailList:result.data})
      this.setData({placeholder:this.data.searchDetailList[0].searchWord})
      this.changePlaceHodler()
    }).catch((err) => {
        return err
    });
  },
  // 动态修改placeholder
  changePlaceHodler(){
    timer = setInterval(()=> {
          let index = this.random(0,this.data.searchDetailList.length)
          this.setData({placeholder:this.data.searchDetailList[index].searchWord})
      },3000)
  },
  // 随机数
  random(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(!timer) return; //不清除定时器的编号，卡掉第一次定时器执行两次的bug
    this.changePlaceHodler()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(timer)
    // timer=null
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})
