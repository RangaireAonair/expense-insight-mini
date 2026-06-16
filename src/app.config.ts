export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/bills/index',
    'pages/add/index',
    'pages/analytics/index',
    'pages/accounts/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#f3fcf0',
    navigationBarTitleText: '记账系统',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f3fcf0'
  },
  lazyCodeLoading: 'requiredComponents'
})
