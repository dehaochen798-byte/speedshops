<template>
  <view class="account-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @click="navigateBack">← 返回</view>
      <view class="title">个人账号信息</view>
      <view class="save-btn" @click="saveInfo">保存修改</view>
    </view>

    <!-- 信息表单 -->
    <view class="info-form">
      <!-- 头像上传 -->
      <view class="form-item">
        <view class="label">头像</view>
        <view class="content">
          <view class="avatar-container">
            <image 
              :src="userInfo.avatar || '/static/other/headerimg.png'" 
              class="avatar"
              mode="aspectFill"
            ></image>
            <view class="upload-btn" @click="chooseAvatar">更换头像</view>
          </view>
        </view>
      </view>

      <!-- 用户名 -->
      <view class="form-item">
        <view class="label">用户名</view>
        <view class="content">
          <input 
            type="text" 
            v-model.lazy="userInfo.nickname" 
            placeholder="请输入用户名"
            class="input"
            :placeholder-style="{color: '#999'}"
          />
        </view>
      </view>
	  
	  <view class="form-item">
	    <view class="label">性别</view>
	    <view class="content">
	      <input 
	        type="text" 
	        v-model.lazy="userInfo.gender" 
	        placeholder="请输入性别"
	        class="input"
	        :placeholder-style="{color: '#999'}"
	      />
	    </view>
	  </view>

      <!-- 手机号 -->
      <view class="form-item">
        <view class="label">手机号</view>
        <view class="content">
          <input 
            type="number" 
            v-model.lazy="userInfo.phone" 
            placeholder="请输入手机号"
            class="input"
            :placeholder-style="{color: '#999'}"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="label">地址</view>
        <view class="content">
          <input 
            type="text" 
            v-model.lazy="userInfo.address" 
            placeholder="请输入地址"
            class="input"
            :placeholder-style="{color: '#999'}"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
const app = getApp()
export default {
  data() {
    return {
      userInfo: {
        nickname: '',
		gender:'',
		avatar:'',
        phone: '',
        address: '',
        cid: '' // 用户ID，用于后端更新标识
      },
      isLoading: false,
      showDebug: true // 手动控制调试信息显示（开发时设为true，上线设为false）
    }
  },
  // 确保DOM渲染完成后再更新数据
  async onReady() {
    await this.loadUserInfo();
  },
  onLoad() {
    console.log('===== 页面加载 =====');
    
    this.userInfo = {
      ...this.userInfo,
    };
  },
  methods: {
    navigateBack() {
      uni.navigateBack({ delta: 1 });
    },

    // 统一请求工具（兼容GET请求参数拼接）
    request(options) {
      return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token');
        const header = {
          'Content-Type': 'application/json',
          Authorization: token || ''
        };

        if (options.method === 'GET' && options.data) {
          const params = new URLSearchParams(options.data);
          options.url += (options.url.includes('?') ? '&' : '?') + params.toString();
          delete options.data; 
        }

        uni.request({
          url: options.url,
          method: options.method || 'GET',
          header,
          data: options.data || {},
          success: (res) => {
         
            if (res.statusCode === 200) {
              resolve(res.data);
            } else {
              reject(new Error(`请求失败：${res.statusCode}`));
            }
          },
          fail: (err) => {
            reject(new Error(`网络错误：${err.errMsg}`));
          }
        });
      });
    },

    // 加载用户信息（核心修复：强制更新视图）
    async loadUserInfo() {
      this.isLoading = true;
      try {
        const cid = uni.getStorageSync('cid');
        if (!cid) {
          uni.showToast({ title: '未登录，请先登录', icon: 'none' });
          return;
        }

        // 调用后端接口（修复GET参数拼接问题）
        const res = await this.request({
          url: app.globalData.baseUrl + 'customer/detail',
          method: 'GET',
          data: { cid }
        });

        this.userInfo = {
          cid: cid,
          nickname: res.mydata.nickname ||  '',
		  gender: res.mydata.gender,
          phone: res.mydata.phone || '',
          address: res.mydata.address || ''
        };

        // 更新本地缓存
        uni.setStorageSync('nickname', this.userInfo.nickname);

      } catch (error) {
        console.error('加载失败：', error);
      } finally {
        this.isLoading = false;
      }
    },

    // 头像选择/上传
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.userInfo.avatar = res.tempFilePaths[0];
          this.uploadAvatar(res.tempFilePaths[0]);
        }
      });
    },
    async uploadAvatar(tempPath) {
      uni.showLoading({ title: '上传中...' });
      try {
        const res = await uni.uploadFile({
          url: app.globalData.baseUrl + 'customer/upload-avatar',
          filePath: tempPath,
          name: 'avatar',
          formData: { cid: this.userInfo.cid },
          header: { Authorization: uni.getStorageSync('token') }
        });
        const data = JSON.parse(res.data);
        if (data.code === 200) {
          this.userInfo.avatar = data.data.url;
          uni.setStorageSync('avatar', data.data.url);
          uni.showToast({ title: '头像上传成功' });
        }
      } catch (err) {
        uni.showToast({ title: '头像上传失败', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    },

    // 保存信息
    async saveInfo() {
      if (!this.userInfo.nickname) {
        uni.showToast({ title: '请输入用户名', icon: 'none' });
        return;
      }
      try {
        await this.request({
          url: app.globalData.baseUrl + 'customer/update',
          method: 'PUT',
          data: this.userInfo
        });
        uni.showToast({ title: '保存成功' });
        setTimeout(() => this.navigateBack(), 1500);
      } catch (err) {
        uni.showToast({ title: '保存失败', icon: 'none' });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.account-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 30rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 120rpx;
  background: #fff;
  padding: 0 30rpx;
  border-bottom: 1px solid #eee;

  .back-btn, .save-btn {
    font-size: 32rpx;
    color: #333;
  }
  .title {
    font-size: 36rpx;
    font-weight: bold;
  }
  .save-btn {
    color: #1677ff;
  }
}

.info-form {
  margin: 20rpx 0;
  background: #fff;

  .form-item {
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    height: 120rpx;
    border-bottom: 1px solid #eee;

    .label {
      width: 180rpx;
      font-size: 32rpx;
      color: #666;
    }
    .content {
      flex: 1;

      .input {
        width: 100%;
        height: 80rpx;
        font-size: 32rpx;
        color: #333;
        line-height: 80rpx;
      }

      .avatar-container {
        display: flex;
        align-items: center;

        .avatar {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          border: 1px solid #eee;
        }
        .upload-btn {
          margin-left: 20rpx;
          font-size: 30rpx;
          color: #1677ff;
        }
      }
    }
  }

  // 调试信息样式
  .debug-info {
    padding: 20rpx 30rpx;
    font-size: 24rpx;
    color: #999;
    background: #f9f9f9;
  }
}
</style>