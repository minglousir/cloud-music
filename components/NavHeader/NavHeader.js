// components/NavHeader/NavHeader.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type:String,
      value:'title'
    },
    nav:{
      type:String,
      value:'nav'
    },
    toPage:{
      type:String,
      value:'toPage'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    toPage(){
      // console.log(this.properties.toPage)
      if(this.properties.toPage!='toPage') {
          wx.navigateTo({
          url: this.properties.toPage,
        })
      }
    },

  }
})
