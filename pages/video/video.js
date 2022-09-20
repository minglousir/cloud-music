// pages/video/video.js
import { formatNumber } from '../../utils/formatNumber'
const app = getApp()
// 解决视频切换tab后再回来自动播放，不需改整个代码结构
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [],//导航标签
    navId: '',//导航标识
    videoList: [],//视频
    videoId: '',//视频id标识
    videoUpdateTime: [],//记录播放时长
    isTriggered: false,//表示下拉刷新
    ViedoUrl:'',// 视频url,单词手误打错了，不改了
    offset:0, // 用于随机加载列表的
    scrollId:'',//自动滚动
    stop: '',//节流阀
    index:0 ,//避免key重复
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getVideoGroupListData();
  },
  
  //获取导航数据
  async getVideoGroupListData(){
    let videoGroupListData = await app.$API.reqVideoHeaderGroupList();
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0,20),
      navId: videoGroupListData.data[0].id
    })
    this.getVideoList(this.data.navId);
  },

  //点击切换导航的回调
  changeNav(event){
    let navId = event.currentTarget.id;//通过id向event事件传参，传的数字会转为string
    this.setData({
      navId: navId>>>0,
      videoList: [],
      offset: 0
    })

    //显示正在加载
    wx.showLoading({
      title: '正在加载',
    })
    //动态获取当前导航的动态数据
    this.getVideoList(this.data.navId);
  },
  // 随机函数
  random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },
  //获取视频列表数据
  async getVideoList(navId,flag){
    this.setData({stop : true})
    // 不知道有多少数据，随机获取1-50页
    // let offset = this.random(0, 10)
    let VideoListData = await app.$API.reqVideoGroupList({id: navId,offset:this.data.offset++});
    if(VideoListData.datas.length === 0){
      wx.showToast({
        title: VideoListData.msg,
        icon: 'none'
      })
      this.setData({
        isTriggered: false
      })
      wx.hideLoading();
      this.setData({stop : false})
      wx.showToast({
        title: '加载失败！',
        icon: 'none'
      })
      return;
    }
    //关闭加载提示
    wx.hideLoading();
    
    // 这里会导致key重复,debug
    // let index = 0;
    let videoList = VideoListData.datas.map(item => {
      this.setData({index:++this.data.index})
      // 它不要切换标签就清空永远是唯一的不管了在哪里加，diff算法都能配上，不要担心数多大的问题
      item.id = this.data.index;
      item.data.commentCount = formatNumber(item.data.commentCount).replace(/万|亿/, "W")
      item.data.praisedCount = formatNumber(item.data.praisedCount).replace(/万|亿/, "W")
      return item;
    })
    // 如果flag为true拼接
    if(flag) {
      this.setData({
        videoList: [...this.data.videoList,...videoList],
        //关闭下拉刷新
        isTriggered: false
      })

    } else {
      this.setData({
        videoList: videoList,
        //关闭下拉刷新
        isTriggered: false
      })
    }
    // 关闭节流阀
    this.setData({stop : false})
    
  },
  getVideoUrl(id) {
    // 现在需要请求视频地址
    app.$API.reqVideoUrl({id}).then(res=>{
      this.setData({
        ViedoUrl: res.urls[0].url
      })
    })
  },
  //点击播放回调
  handlePlay(event){
    //播放新视频之前找到上一个正在播放的视频并关闭
    let vid = event.currentTarget.id;
    let preUrl = event.currentTarget.dataset.url;
    if (!preUrl) return
    this.setData({
      ViedoUrl: preUrl
    })
    //怎样关闭上一个视频？找到上一个视频的实例
    //如何确认点击播放的视频与正在播放的视频不是同一个(通过vid的对比)
    //this.vid !==vid && this.videoContext && this.videoContext.stop();
    //this.vid = vid;
    this.getVideoUrl(vid)
    
    this.setData({
      videoId: vid
    })

    //创建控制video的实例对象
    this.videoContext = wx.createVideoContext(vid);
    //判断当前的视频是否播放过，有播放记录，有则跳转到之上次播放的位置
    let {videoUpdateTime} = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid === vid);
    if(videoItem){
      this.videoContext.seek(videoItem.currentTime);
    }

    //this.videoContext.play();
  },

  //监听视频播放进度
  handleTimeUpdate(event){
    let videoTimeObj = {vid: event.currentTarget.id, currentTime: event.detail.currentTime};
    let {videoUpdateTime} = this.data;

    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
    //如果数组中有当前视频对应的时间就更新，没有则添加,且播放进度不能小于当前
    if(videoItem){
      videoItem.currentTime = videoTimeObj.currentTime;
    }else{
      videoUpdateTime.push(videoTimeObj);
    }
    //更新
    this.setData({
      videoUpdateTime: videoUpdateTime
    })
  },
  //视频播放结束调用
  handleEnded(event){
    //移除播放时长数组中以结束的视频
    let {videoUpdateTime} = this.data;
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id),1);
    // 自动播放
    let currentIndex = this.data.videoList.findIndex(item => item.data.vid == this.data.videoId)
    this.setData({
      videoUpdateTime: videoUpdateTime
    })
    if(currentIndex<this.data.videoList.length-1){
      let vid = this.data.videoList[currentIndex+1].data.vid
      this.setData({videoId:vid})
      this.videoContext = wx.createVideoContext(vid);
      this.getVideoUrl(vid)
      // 滚动指定窗口
      this.setData({
        scrollId: this.data.videoList[currentIndex+1].id
      })
    }
  },
  //自定义下拉刷新
  handleRefresher(){
    this.getVideoList(this.data.navId);
  },
  // 上拉刷新
  getMore() {
    if(this.data.stop) return
    // console.log(this.data.stop)
    this.getVideoList(this.data.navId,true);
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
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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
    // 已经自定义可用注掉
    // this.getVideoList(this.data.navId);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function ({from}) {
    return {
      title: '来自网易云音乐的转发'
    }
  }
})