// 拦截所有请求，自动添加 token
uni.addInterceptor('request', {
  // 请求发出前的处理
  invoke(args) {
    // 从本地存储获取 token
    const token = uni.getStorageSync('token')
  
    if (token) {
      // 初始化 header（防止原请求没有 header 导致的错误）
      args.header = args.header || {}
      // 按后端要求的格式添加（常见格式：Bearer + 空格 + token）
      args.header.Authorization = `${token}`
    }
  },
  // 请求失败的处理（可选）
  fail(err) {
    console.error('请求失败:', err)
  }
})