<template>
  <view class="container">
    <!-- 登录注册容器 -->
    <view class="auth-container">
      <view class="auth-title">{{ isLoginMode ? '账号登录' : '账号注册' }}</view>
      
      <!-- 用户名输入 -->
      <view class="input-group">
        <input 
          type="text" 
          v-model="username" 
          placeholder="请输入用户名" 
          class="input-item"
        />
      </view>
      
      <!-- 密码输入 -->
      <view class="input-group">
        <input 
          type="password" 
          v-model="password" 
          placeholder="请输入密码" 
          class="input-item"
        />
      </view>
      
      <!-- 注册时显示确认密码 -->
      <view class="input-group" v-if="!isLoginMode">
        <input 
          type="password" 
          v-model="confirmPassword" 
          placeholder="请确认密码" 
          class="input-item"
        />
      </view>
      
      <!-- 操作按钮 -->
      <button 
        class="auth-btn" 
        @click="handleAuth"
        :loading="loading"
      >
        {{ isLoginMode ? '登录' : '注册' }}
      </button>
      
      <!-- 切换模式 -->
      <view class="toggle-mode" @click="toggleMode">
        {{ isLoginMode ? '还没有账号？去注册' : '已有账号？去登录' }}
      </view>
    </view>
  </view>
</template>

<script>	
import { jwtVerify } from 'jose';
const REY = 'dmg'; 
/**
 * 解析并验证JWT Token，提取claims字段（与后端parseToken方法逻辑一致）
 * @param {string} token - 待解析的JWT Token
 * @returns {Promise<Record<string, any>>} - 解析后的claims对象
 * @throws {Error} - Token无效/签名错误/过期等异常
 */
async function parseToken(token) {
  try {
    // 1. 将密钥转换为Uint8Array（jose库要求）
    const secret = new TextEncoder().encode(REY);
    
    // 2. 验证签名并解析Token（与后端JWT.require(Algorithm.HMAC256).build().verify()逻辑一致）
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'] // 强制指定HMAC256算法，与后端对齐
    });

    // 3. 提取claims字段（与后端getClaim("claims").asMap()逻辑一致）
    const claims = payload.claims;
    
    // 校验claims是否存在
    if (!claims || typeof claims !== 'object') {
      throw new Error('Token中未找到有效的claims字段');
    }

    return claims;
  } catch (error) {
    // 错误分类（可选，便于前端处理）
    if (error.name === 'JWTExpired') {
      throw new Error('Token已过期');
    } else if (error.name === 'JWTSignatureVerificationFailed') {
      throw new Error('Token签名验证失败');
    } else {
      throw new Error(`解析Token失败：${error.message}`);
    }
  }
}
const app = getApp();
export default {
  data() {
    return {
      isLoginMode: true, // true:登录模式 false:注册模式
      username: '',
      password: '',
      confirmPassword: '',
      loading: false
    }
  },

  methods: {
    // 切换登录/注册模式
    toggleMode() {
      this.isLoginMode = !this.isLoginMode
      // 清空输入
      this.password = ''
      this.confirmPassword = ''
    },
    
    async handleAuth() {
      // 表单验证
      if (!this.validateForm()) {
        return
      }
      
      this.loading = true
      try {
        // 核心修改：接口地址改为8089端口
        var baseUrl = 'http://localhost:8089' // 替换为你的后端IP/域名
        var url = this.isLoginMode 
          ? baseUrl + '/customer/login' 
          : baseUrl + '/customer/register'
          
        var data = {
          username: this.username,
          password: this.password
        }
        
        // 注册时添加确认密码
        if (!this.isLoginMode) {
          data.confirmPassword = this.confirmPassword
        }
        
        var res = await uni.request({
          url: url,
          method: 'POST',
          data: data,
		  header: {
		    'Content-Type': 'application/x-www-form-urlencoded'
					}
        })
		
        var result = res.data
        if (result.statusCode === 200) {
          // 登录成功保存token
          if (this.isLoginMode) {
            uni.setStorageSync('token', result.mydata)
			const token = uni.getStorageSync('token')
			parseToken(token)
			  .then(claims => {
			    // 核心：从claims对象中取出username
			    const nickname = claims.nickname;
				const cid = claims.cid;
				const state = claims.state;
				const userInfo = {
				    cid: cid // 适配后端返回格式
				};
				this.loginSuccess(userInfo);
			    
			    // 业务逻辑：如渲染到页面、存储到本地等
			    localStorage.setItem('nickname', nickname);
				localStorage.setItem('state', state);
				localStorage.setItem('cid', cid);
				getApp().globalData.cid = cid;
			  })
			  .catch(error => {
			    console.error('解析失败：', error.message);
			  });
          }
          uni.showToast({
            title: this.isLoginMode ? '登录成功' : '注册成功',
            icon: 'success'
          })
          // 跳转首页
          setTimeout(this.dumpPage, 1000)
        } else {
          uni.showToast({
            title: result.msg || (this.isLoginMode ? '登录失败' : '注册失败'),
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('操作失败:', error)
        uni.showToast({
          title: '操作失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 表单验证
    validateForm() {
      if (!this.username.trim()) {
        uni.showToast({ title: '请输入用户名', icon: 'none' })
        return false
      }
      
      if (!this.password.trim()) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return false
      }
      
      // 密码长度验证
      if (this.password.length < 3) {
        uni.showToast({ title: '密码长度不能少于3位', icon: 'none' })
        return false
      }
      
      // 注册时验证确认密码
      if (!this.isLoginMode && this.password !== this.confirmPassword) {
        uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
        return false
      }
      
      return true
    },
	
	loginSuccess(userInfo) {
	    // 更新全局用户ID（cid）
	    app.globalData.cid = userInfo.cid; 
	    // 清空全局购物车相关数据
	    app.globalData.cartAllTotalNums = 0;
	    app.globalData.neworders = [];
	    // 清空全局购物车列表（如果存在）
	    if (app.globalData.cartList) {
	      app.globalData.cartList = [];
	    }
	  },
    
    // 跳转到首页
    dumpPage() {
      uni.switchTab({
        url: "/pages/index/index"
      })
    }
  }
}
</script>
<style>
.container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 150rpx;
  box-sizing: border-box;
}

.auth-container {
  width: 90%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 50rpx 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.auth-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 60rpx;
}

.input-group {
  margin-bottom: 30rpx;
}

.input-item {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  padding: 0 20rpx;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  font-size: 32rpx;
  box-sizing: border-box;
}

.auth-btn {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  background-color: #FC2B55;
  color: #fff;
  font-size: 34rpx;
  border-radius: 10rpx;
  margin-top: 20rpx;
}

.toggle-mode {
  text-align: center;
  margin-top: 30rpx;
  color: #007aff;
  font-size: 28rpx;
  cursor: pointer;
}
</style>