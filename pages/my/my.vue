<template>
	<view class="my_header">
		<image src="/static/other/headerimg.png" class="headerimg"></image>
		<view class="denglu_username">{{loginUser}}</view>
	</view>

	<view class="itemlist" v-for="(item,index) in itemlist" :data-itemid="item.id" @click="selectItem">
		<image :src="item.icon" class="iconimg"></image>
		<view class="itemtitle">{{item.title}}</view>
		<view class="arrow">></view>
	</view>
</template>

<script>
	const app = getApp({
		allowDefault: true
	})
	export default {
		data() {
			return {
				itemlist: [{
						"id": 1,
						"icon": "/static/other/icon01.png",
						"title": "个人信息"
					},
					{
						"id": 5,
						"icon": "/static/other/icon05.png",
						"title": "退出登录"
					}
				],
				isLogin: app.globalData.isLogin,
				loginUser: ''
			}
		},
		onShow() {
		    // 页面显示时，从全局/缓存获取 token 并解析用户名
		    this.updateUserInfoFromToken();
		  },
		methods: {
			// 新增：从 token 解析并更新用户信息
			    updateUserInfoFromToken() {
			      // 1. 获取 token
			      const token = uni.getStorageSync('token');
			      
			      if (token) {
			            // 核心：从claims对象中取出username
			            this.loginUser = localStorage.getItem("nickname");
			      } else {
			        this.loginUser = ''; // 未登录或无 token 时清空
			      }
			    },
				
			selectItem(arg) {
				let itemid = arg.currentTarget.dataset.itemid
				switch (itemid) {
					case 1:
						uni.navigateTo({
							url:'/pages/my/accountInfo'
						})
						break;
					case 5:
					  // 显示确认退出弹窗
					  uni.showModal({
					    title: '确认退出',
					    content: '确定要退出当前账号吗？',
					    confirmText: '退出',
					    cancelText: '取消',
					    success: (res) => {
					      if (res.confirm) {
					        // 用户确认退出，执行退出逻辑
					        app.globalData.isLogin = false;
					        this.isLogin = false;
					        
					        // 清除本地存储的token和用户信息
					        uni.removeStorageSync('token');
					        uni.removeStorageSync('nickname');
					        uni.removeStorageSync('cid');
					        
					        // 清空页面显示的用户名
					        this.loginUser = '';
					        
					        // 显示退出成功提示
					        uni.showToast({
					          title: '退出成功',
					          icon: 'success',
					          duration: 1500
					        });
					        
					        // 延迟跳转至登录页面
					        setTimeout(() => {
					          uni.reLaunch({
					            url: '/pages/starter/starter' 
					          });
					        }, 1500);
					      }
					    
					    }
					  });
					  break;
				}
			}
		},
	}
</script>

<style lang="scss" scoped>
	.my_header {
		width: 100%;
		height: 430rpx;
		background-color: #FFF;
		display: flex;
		align-items: center;
		justify-content: space-around;
		box-sizing: border-box;
		padding: 90rpx 80rpx 50rpx 0;
		margin-bottom: 50rpx;


		.headerimg {
			width: 220rpx;
			height: 220rpx;
			border-radius: 20rpx;
		}

		.denglu_btn {
			width: 270rpx;
			height: 80rpx;
			background-color: cornflowerblue;
			color: #FFF;
			text-align: center;
			line-height: 80rpx;
		}

		.denglu_username {
			width: 270rpx;
		}

	}

	.itemlist {
		width: 100%;
		height: 110rpx;
		background-color: #FFF;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 50rpx;
		box-sizing: border-box;
		color: #333;
		margin: 15rpx auto;
		font-size: 34rpx;

		.iconimg {
			width: 60rpx;
			height: 60rpx;
		}

		.itemtitle {
			flex-grow: 1;
			/* background-color: aqua; */
			padding-left: 20rpx;
		}

		.arrow {
			color: #CCC;
			font-size: 40rpx;
		}
	}

	.uni-popup__wrapper {
		border-radius: 20rpx;
	}

	.popup-content {
		width: 600rpx;
		height: auto;
		padding: 50rpx;
		box-sizing: border-box;
		color: #333;
		position: relative;
		overflow: hidden;
		z-index: 70;
		font-size: 34rpx;

		.close {
			position: absolute;
			right: 10rpx;
			top: 10rpx;
		}

		.title {
			font-size: 36rpx;
			font-weight: bold;
		}

		.inputview {
			display: flex;
			margin: 30rpx auto;

			.myinput {
				border: 2rpx solid #CCC;
				width: 380rpx;
				height: 60rpx;
				padding-left: 30rpx;
				box-sizing: border-box;
			}
		}

		.loginbtn {
			width: 490rpx;
			height: 80rpx;
			background-color: cornflowerblue;
			color: #FFF;
			text-align: center;
			line-height: 75rpx;
		}
	}
</style>