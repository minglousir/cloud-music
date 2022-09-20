import request from '../utils/request'
// 注：有参数，不设置默认参数的一般都需要页面传参,此处存放所有请求
// 轮播请求函数 
export const getHomeBanner = (params={type:2}) => request('/banner',params)

// 推荐歌曲
export const getHomePersonalized = (params={limit:10}) => request('/personalized',params )

// /playlist/detail 获取各大榜单数据
export const getHomeTopPlaylist = (params={id:19723756}) => request('/playlist/detail',params )

// 热搜列表(推荐词)
export const reqSearchDetailList = () => request('/search/hot/detail');

// 请求默认搜索关键词
export const reqSearchDefaultWord = () => request('/search/default');

// 所有榜单接口
export const reqSearchAllToplistList = () => request('/toplist');

// 搜索功能
export const reqSearchList = (params) => request('/search',params);

// 获取验证码 /captcha/sent?phone=13xxx
export const reqLoginCode = (params) => request('/captcha/sent',params);

// 验证码登录 /captcha/verify?phone=13xxx&captcha=1597
export const Login = (params) => request('/captcha/verify',params);

// 密码登录
export const LoginByPassword = (params) => request('/login/cellphone',params);

// 退出登录
export const logout = () => request('/logout');

// 获取用户播放记录
export const reqUserRecordList = (params) => request('/user/record',params);

// 获取视频列表表头 
export const reqVideoHeaderGroupList = (params) => request('/video/group/list');

// 获取视频列表
export const reqVideoGroupList = (params) => request('/video/group',params);

// 获取视频地址
export const reqVideoUrl = (params) => request('/video/url',params);

// 获取每日推荐歌曲
export const reqRecommendSongsList = () => request('/recommend/songs');

// 获取当前歌单
export const reqPlayListDetail = (params) => request('/playlist/detail',params);

// 获取当前歌曲详情
export const reqSongDetail = (params) => request('/song/detail',params);

// 获取歌词
export const reqLyricList = (params) => request('/lyric',params);

// 获取音频资源
export const reqSongUrl = (params) => request('/song/url',params);

















