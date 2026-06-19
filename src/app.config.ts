export default defineAppConfig({
  pages: [
    'pages/orders/index',
    'pages/clients/index',
    'pages/quotations/index',
    'pages/progress/index',
    'pages/mine/index',
    'pages/order-detail/index',
    'pages/order-create/index',
    'pages/client-detail/index',
    'pages/quotation-detail/index',
    'pages/progress-detail/index',
    'pages/delivery/index',
    'pages/statistics/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#7C3AED',
    navigationBarTitleText: '插画师工作台',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#7C3AED',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/orders/index',
        text: '订单看板'
      },
      {
        pagePath: 'pages/clients/index',
        text: '客户资料'
      },
      {
        pagePath: 'pages/quotations/index',
        text: '报价单'
      },
      {
        pagePath: 'pages/progress/index',
        text: '进度记录'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
