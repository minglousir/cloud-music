// pages/songDetail/songDetail.js

// 真机测试有一些bug，有时有，有事没有，感觉是同步的问题，大量测试发现同一种情况，bug是不一定的,就像进来自动播放的bug，整个流程都走完了输出数据没问题，但是就是会卡bug
// 程序设计有缺陷请求多了需要等待所有请求都回来后再显示，否则会有bug
// 此外还有一个不过当你退出这个页面，就会变单曲循环，这是因为页面销毁了，无法下一曲

import PubSub from 'pubsub-js';
import moment from 'moment';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,//标识播放状态
    isflag:false, //音乐播放臂的标识,有一个缺点，isplay让机械臂
    song: {},//歌曲详情对象
    musicId: '',//歌曲Id
    currentTime: '00:00',//当前时长
    durationTime:'00:00',//总时长
    currentWidth: 0,//实时进度条宽度
    lyric: [],//歌词
    lyricTime: 0,//歌词对应的时间
    currentLyric: "",//当前歌词对象
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options路由跳转参数
    let musicId = options.song;
    this.getMusicInfo(musicId);
    this.getLyric(musicId);
    this.setData({
      musicId: musicId
    })
    //判断当前页面音乐是否在播放
    if(app.globalData.isMusicPlay && app.globalData.musicId === musicId){
      //修改当前页面音乐播放状态
      this.setData({
        isPlay: true,
        isflag: true
      })
      return;
    }
    
    //创建控制音乐播放实例对象
    this.backgroundAudioManager = null
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    
    //监视音乐播放与暂停
    this.backgroundAudioManager.onPlay(()=>{
      //修改音乐播放状态
      this.changePlayState(true);

      app.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(()=>{
      this.changePlayState(false);
    });
    this.backgroundAudioManager.onStop(()=>{
      this.changePlayState(false);
    });
    //音乐播放自然结束
    this.backgroundAudioManager.onEnded(()=>{
      //切歌
      // PubSub.publish('switchMusic','next');
      //重置所有数据
      this.setData({
        currentWidth: 0,
        currentTime: '00:00',
        lyric: [],
        lyricTime: 0,
        isPlay: false,
        currentLyric: ""
      })
      this.getMuscicByPubSub('next')
      
    })
    //监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      this.musicPlayTime()
    })
    // 自动播放新歌曲，这里必定是新歌,跟给标签设置不同，同一首歌不会中断
    this.handleMusicPlay()
    
  },

  //观察音乐播放进度
  musicPlayTime(){
    //获取歌词对应时间
    let lyricTime = Math.ceil(this.backgroundAudioManager.currentTime); 
    let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss');
    // 会员歌曲会出bug,这里可以判断哪个是会员歌曲
    // let currentWidth = (this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration) * 450;
    let currentWidth = (this.backgroundAudioManager.currentTime/(this.data.song.dt / 1000)) * 450;
    
    this.setData({
      lyricTime,
      currentTime,
      currentWidth
    })
    //获取当前歌词
    this.getCurrentLyric();
  },

  //修改播放状态
  changePlayState(isPlay){
    this.setData({
      isPlay: isPlay,
      isflag: isPlay
    })
    //修改全局播放状态
    app.globalData.isMusicPlay = isPlay;
  },
  //点击暂停/播放的回调
  handleMusicPlay(){
    //修改是否播放的状态
    let isPlay = !this.data.isPlay;
    this.setData({
      isPlay: isPlay
    })
  
    let {musicId} = this.data;
    this.musicControl(isPlay,musicId);
  },
  //请求歌曲信息
  async getMusicInfo(musicId){
    wx.showLoading({
      title: '正在加载',
    })
    let songData = await app.$API.reqSongDetail({ids: musicId})
    wx.hideLoading();
    let durationTime = moment(songData.songs[0].dt).format('mm:ss');
    this.setData({
      song: songData.songs[0],
      durationTime: durationTime
    })
    //动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })
  },

  //歌曲播放控制功能
  async musicControl(isPlay,musicId){

    if(isPlay){//音乐播放
      //获取音频资源
      let musicLinkData = await app.$API.reqSongUrl({id: musicId}) // musicId
      // console.log(musicLinkData)
      let musicLink = musicLinkData.data[0].url;
      if(musicLink === null){
        wx.showToast({
          title: musicLink.data.message,
          icon: 'none'
        })
        return;
      }
      this.setData({
        isflag:isPlay
      })
      //歌曲播放
      this.backgroundAudioManager.src = musicLink;
      // 要加上才能播放
      this.backgroundAudioManager.title = this.data.song.name;
    }else{//音乐暂停
      this.backgroundAudioManager.pause();
    }
  },

  //歌曲切换
  handleSwitch(event){
    //切换类型
    let type = event.currentTarget.id;

    //关闭当前播放音乐
    this.backgroundAudioManager.stop();
    // 订阅与发布
    this.getMuscicByPubSub(type)
    
  },
  getMuscicByPubSub(type) {
    //订阅来自recommendSong页面
    PubSub.subscribe('musicId',(msg,musicId) => {
      //获取歌曲
      this.getMusicInfo(musicId);
      //获得歌词
      this.getLyric(musicId);
      //自动播放当前音乐
      this.musicControl(true,musicId);
      //取消订阅
      // 用于测试单曲循环的bug
      // console.log(musicId+"55")
      PubSub.unsubscribe('musicId');
    })
    //发布消息数据给recommendSong页面
    PubSub.publish('switchMusic',type);
  },

  //获取歌词
  async getLyric(musicId){
    let lyricData = await app.$API.reqLyricList({id: musicId});
    let lyric = this.formatLyric(lyricData.lrc.lyric);
  },

  //传入初始歌词文本text
  formatLyric(text) {
    let result = [];
    let arr = text.split("\n"); //原歌词文本已经换好行了方便很多，我们直接通过换行符“\n”进行切割
    let row = arr.length; //获取歌词行数
    for (let i = 0; i < row; i++) {
      let temp_row = arr[i]; //现在每一行格式大概就是这样"[00:04.302][02:10.00]hello world";
      let temp_arr = temp_row.split("]");//我们可以通过“]”对时间和文本进行分离
      let text = temp_arr.pop(); //把歌词文本从数组中剔除出来，获取到歌词文本了！
      //再对剩下的歌词时间进行处理
      temp_arr.forEach(element => {
        let obj = {};
        let time_arr = element.substr(1, element.length - 1).split(":");//先把多余的“[”去掉，再分离出分、秒
        let s = parseInt(time_arr[0]) * 60 + Math.ceil(time_arr[1]); //把时间转换成与currentTime相同的类型，方便待会实现滚动效果
        obj.time = s;
        obj.text = text;
        result.push(obj); //每一行歌词对象存到组件的lyric歌词属性里
      });
    }
    result.sort(this.sortRule) //由于不同时间的相同歌词我们给排到一起了，所以这里要以时间顺序重新排列一下
    this.setData({
      lyric: result
    })
  },
  sortRule(a, b) { //设置一下排序规则
    return a.time - b.time;
  },

  //控制歌词播放
  getCurrentLyric(){
    let j;
    for(j=0; j<this.data.lyric.length-1; j++){
      if(this.data.lyricTime == this.data.lyric[j].time){
        this.setData({
          currentLyric : this.data.lyric[j].text
        })
      }
    }
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