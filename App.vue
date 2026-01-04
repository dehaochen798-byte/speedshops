<script>
	export default {
		globalData: {
			baseUrl: 'http://localhost:8089/',
			cid: 1, // 默认值，登录后会被覆盖
			curGoods: {},
			cartAllTotalNums: 0
		},
		onLaunch: function() {
			console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
			console.log('App Launch')
			
			// 启动时读取本地存储的 cid
			const storedCid = uni.getStorageSync('cid')
			// 如果存在则更新 globalData 中的 cid
			if (storedCid) {
				this.globalData.cid = storedCid
			}
		},
		onShow: function() {
			console.log('App Show')
			// 每次页面显示时也检查一次（防止登录后未重启App的情况）
			const storedCid = uni.getStorageSync('cid')
			if (storedCid && storedCid !== this.globalData.cid) {
				this.globalData.cid = storedCid
				
			}
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>
