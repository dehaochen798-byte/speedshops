<template>
	<!-- 头部 -->
	<view class="top">
		<!-- 头部导航 -->
		<view class="head_nav">
			<uni-icons type="plus" size="30"></uni-icons>
			<view class="nav_title" :class="curNavIndex==4?'active':''" @click="clickHeadNav(4)">Speed商城，送啥都快：）</view>
			
		</view>
		<!-- 头部导航 -->

		<!-- 搜索 -->
		<view class="searchparent">
			<view class="search">
				<uni-icons type="search" size="25" color="#AAAAAA"></uni-icons>
				<input type="text" name="keyword" v-model="keyword" />
				<uni-icons type="camera" size="25" color="#AAAAAA"></uni-icons>
				<text class="btntext" @click="search">搜索</text>
			</view>
			<navigator url="/pages/cart/cart" open-type="switchTab">
				<view class="cart_more" v-if="isShowCart">
					<uni-icons type="cart" size="25"></uni-icons>
					<text class="cart_more_text">购物车</text>
					<view class="cart_nums">{{cartAllTotalNums}}</view>
				</view>
			</navigator>
			<view class="cart_more">
				<uni-icons type="list" size="24"></uni-icons>
				<text class="cart_more_text">更多</text>
			</view>
		</view>
		<!-- 搜索 -->
	</view>
	<!-- 头部 -->

	<!-- 垫出头部高度 -->
	<view style="width: 100%;height: 240rpx;"></view>
	<!-- 垫出头部高度 -->

	<!-- 订单及购物车 -->
	<view class="orders_cart_parent">
			<navigator url="/pages/orders/orders" open-type="switchTab" style="display: block;height: 100%;line-height: 55rpx;" class="orders_cart_item">
			<uni-icons type="calendar" size="25"></uni-icons>
			<text class="item_text">我的订单</text>
			<text class="item_text">快捷查单</text>
			</navigator>
		
		<!-- <view class="orders_cart_item"> -->
			<navigator url="/pages/cart/cart" open-type="switchTab" style="display: block;height: 100%;line-height: 55rpx;" class="orders_cart_item">
				<uni-icons type="cart" size="25"></uni-icons>
				<text class="item_text">购物车</text>
				<text class="item_text">商品({{cartAllTotalNums}})</text>
			</navigator>
		<!-- </view> -->

	</view>
	<!-- 订单及购物车 -->

	<!-- 轮播广告 -->
	<swiper autoplay="true" indicator-dots="true" interval="3000" class="bannerparent">
		<swiper-item>
			<image src="/static/goodsbanner01.png" class="bannerimg"></image>
		</swiper-item>
		<swiper-item>
			<image src="/static/goodsbanner02.png" class="bannerimg"></image>
		</swiper-item>
		<swiper-item>
			<image src="/static/goodsbanner03.png" class="bannerimg"></image>
		</swiper-item>
	</swiper>
	<!-- 轮播广告 -->

	<!-- 商品分类名称 -->
	<scroll-view scroll-x="true" class="categorylist">
		<view class="categoryitem" :class="selectedCategoryitem==index?'active':''" v-for="(item,index) in categorylist"
			@click="clickCategoryitem(index,item.cgid)">
			{{item.cgname}}
		</view>
	</scroll-view>
	<!-- 商品分类名称 -->

	<!-- 商品列表组件 -->
	<GoodsList ref="mygoodslist"></GoodsList>
	<!-- 商品列表组件 -->
</template>

<script>
	/**
	 * 使用组件分为3步骤
	 * 1. 创建组件
	 * 2. 引入组件并且注册组件
	 * 3. 使用组件
	 */
	import GoodsList from '@/components/GoodsList/GoodsList.vue'
	const app = getApp({
		allowDefault: true
	})
	export default {
		// 注册组件
		components: {
			GoodsList
		},
		data() {
			return {
				curNavIndex: 4,
				categorylist: [],
				selectedCategoryitem: 0,
				isShowCart: true,
				keyword: '',
				cartAllTotalNums: 0
			}
		},
		// 生命周期函数
		created() {
			// 调用远程加载商品分类
			this.loadCategoryList()
			// 加载购物车数量
			this.loadCart()
		},
		onPageScroll(e) {
			// console.log(e)
			let viewHeight = e.scrollTop
			if (viewHeight > 300) {
				this.isShowCart = false
			} else {
				this.isShowCart = true
			}
		},
		methods: {
			loadCart() {
				// 加载购物车的数据
				 this.cartlist =[]
				// 发送请求
				uni.request({
					url: app.globalData.baseUrl + 'cart/getcartlist/' + app.globalData.cid,
					success: (res) => {
						if (res.data.statusCode == 200) {
							this.cartlist = res.data.mydata
							app.globalData.cartAllTotalNums = 0
							this.cartlist.forEach((item, index) => {
								app.globalData.cartAllTotalNums += item.goodsDetail.length
							})
							this.cartAllTotalNums = app.globalData.cartAllTotalNums
						}
					}
				})
			},
			// 搜索
			search() {
				/**
				 * 父组件向子组件传值，有常用两种方式
				 * 1. 静态传值 
				 * 2. 动态传值 
				 *    2.1 为子组件定义一个属性ref的值
				 *    2.2 调用子组件方法 this.$refs.子组件ref名称.方法
				 */
				this.$refs.mygoodslist.searchKeyWord(this.keyword)
			},
			// 点击激活导航
			clickHeadNav(index) {
				this.curNavIndex = index
			},
			//远程加载商品分类
			loadCategoryList() {
				// 发送请求
				uni.request({
					url: app.globalData.baseUrl + 'category/findall',
					success: (res) => {
						if (res.data.statusCode == 200) {
							this.categorylist = res.data.mydata
							console.log(this.categorylist)
						}
						// console.log(res)
					}
				})
			},
			clickCategoryitem(index, cgid) {
				this.selectedCategoryitem = index
				/**
				 * 父组件向子组件传值，有常用两种方式
				 * 1. 静态传值 
				 * 2. 动态传值 
				 *    2.1 为子组件定义一个属性ref的值
				 *    2.2 调用子组件方法 this.$refs.子组件ref名称.方法
				 */
				this.$refs.mygoodslist.loadGoodsList(cgid)
			}

		}
	}
</script>

<style lang="scss">
	.top {
		width: 100%;
		height: 240rpx;
		background-color: #F8F8F8;
		// 设置头部固定
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;


		.head_nav {
			width: 95%;
			height: 150rpx;
			// background-color: red;
			margin: 0 auto;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 0 10rpx;
			padding-top: 70rpx;
			box-sizing: border-box;


			.nav_title {
				font-size: 34rpx;
				font-weight: bold;
				color: #777;
			}

			.active {
				color: #333;
			}

			/*伪元素*/
			.active::after {
				content: "";
				display: block;
				width: 60rpx;
				height: 4rpx;
				background-color: #333;
				margin: 3rpx auto;
			}
		}

		.searchparent {
			width: 95%;
			height: 75rpx;
			// background-color: rosybrown;
			margin: 0 auto;
			display: flex;
			justify-content: space-between;
			white-space: nowrap;

			.search {
				flex-grow: 1;
				height: 100%;
				border: 4rpx solid red;
				box-sizing: border-box;
				border-radius: 15rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0 15rpx;

				.btntext {
					font-size: 28rpx;
					color: red;
					font-weight: bold;
				}
			}

			.cart_more {
				width: 70rpx;
				height: 100%;
				font-size: 20rpx;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				white-space: nowrap;
				// background-color: royalblue;
				position: relative;

				.cart_nums {
					width: 24rpx;
					height: 24rpx;
					background-color: orange;
					text-align: center;
					color: #FFF;
					border-radius: 12rpx;
					/*子绝父相*/
					position: absolute;
					top: 0;
					right: 0;
				}
			}
		}
	}

	.orders_cart_parent {
		width: 95%;
		height: 65rpx;
		// background-color: aqua;
		margin: 10rpx auto;
		display: flex;
		justify-content: space-between;

		.orders_cart_item {
			width: 49%;
			height: 100%;
			background-color: #FFF;
			border-radius: 15rpx;
			padding-left: 20rpx;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			font-size: 24rpx;

			.item_text {
				padding: 0 8rpx;
			}
		}
	}

	.bannerparent {
		width: 95%;
		height: 300rpx;
		margin: 15rpx auto;
		border-radius: 15rpx;
		overflow: hidden;

		.bannerimg {
			width: 100%;
			height: 100%;

		}
	}

	.categorylist {
		width: 95%;
		height: 80rpx;
		// background-color: aqua;
		margin: 15rpx auto;
		color: #777;
		font-size: 25rpx;
		font-weight: bold;
		/* 不换行*/
		white-space: nowrap;

		.categoryitem {
			/*行内块*/
			display: inline-block;
			padding: 20rpx;
		}

		.active {
			color: #333;
		}

		.active::after {
			content: "";
			display: block;
			width: 40rpx;
			height: 4rpx;
			background-color: red;
			margin: 3rpx auto;
		}
	}
</style>