<template>
	<view>
		<swiper class="goodsswiper" autoplay="true">
			<swiper-item v-for="(item,index) in curgoods.icons">
				<image :src="item"></image>
			</swiper-item>
		</swiper>
		
		<view class="container">
			<!-- 商品价格 -->
			<view class="goods-price-name container-moudle">
				<view class="goods-price">
					<view class="goods-price-parent">
						<view class="danwei">￥</view>
						<view class="my-price">{{curgoods.price}}</view>
						<view class="danwei">起</view>
					</view>
					<view class="my-selltotalnum">已售{{curgoods.sellTotalNum}}件</view>
				</view>
				<view class="goods-title">
					{{curgoods.gname}}
				</view>
			</view>
			<!-- 商品价格 -->
			<!-- 商品选择 -->
			<view class="goods-select container-moudle">
				<view class="goods-select-p" @click="openSafe(curgoods.cgid)">
					<view class="goods-select-type">
						保障
					</view>
					<view class="goods-select-title">
						<text v-for="(safeitem,index) in curgoods.safeguardList">
							<text v-if="index<3">
								{{safeitem.sgname}}
							</text>
							<text v-if="index<2">•</text>
						</text>
					</view>
					<view class="showArrow">
						<uni-icons type="forward" color="#AAA" size="16"></uni-icons>
					</view>
				</view>
				<view class="goods-select-p" @click="openBuyGoods">
					<view class="goods-select-type">
						选择
					</view>
					<view class="goods-select-title">
						<view class="goods-select-left">
							<!-- 商品缩略图 -->
							<image v-if="curgoods.selectType==2" :src="item.gdpic"
								v-for="(item,index) in curgoods.goodsDetailList"
								class="goods-select-left-pics-item"></image>
							<!-- 商品缩略图 -->
							<!-- 商品标题 -->
							<view v-if="curgoods.selectType==1" class="goods-select-left-gname"
								v-for="(item,index) in curgoods.goodsDetailList">
								{{item.attributeValue1}}
							</view>
							<!-- 商品标题 -->
						</view>
						<view class="goods-select-text">
							{{curgoods.selectTypeText}}
						</view>
					</view>
					<view class="showArrow">
						<uni-icons type="forward" color="#AAA" size="16"></uni-icons>
					</view>
				</view>
				<view class="goods-select-p">
					<view class="goods-select-type">
						活动
					</view>
					<view class="goods-select-title">
						抖音月付 先领劵再下单！{{curgoods.discounts}}
					</view>
					<view class="showArrow">
						<uni-icons type="forward" color="#AAA" size="16"></uni-icons>
					</view>
				</view>
				<view class="goods-select-p">
					<view class="goods-select-type">
						物流
					</view>
					<view class="goods-select-title">
						现货 1小时内送到货，
						<text v-if="curgoods.postprice<=0">
							包邮
						</text>
						<text v-else>邮费:￥{{curgoods.postprice}}</text>
						
					</view>
				</view>
			</view>
			<!-- 商品选择 -->

			<!-- 商品评价 -->
			<view class="container-moudle">
				<Evaluate :evaluateCount="curgoods.evaluateCount" :evaluateList="curgoods.evaluateList"></Evaluate>
			</view>
			<!-- 商品评价 -->

			
		</view>

		<view style="width: 50px;height: 60px;"></view>
		
		<!-- 底部导航 -->
		<view class="footer">
			<view class="nav-item" @click="openHome">
				<uni-icons type="shop" size="28"></uni-icons>
				<text>主页</text>
			</view>
			<view class="nav-item" @click="openCart">
				<uni-icons type="cart" size="28"></uni-icons>
				<text>购物车</text>
				<view class="cart-num" v-if="cartAllTotalNums>0">{{cartAllTotalNums}}</view>
			</view>
			<view class="nav-item">
				<uni-icons type="headphones" size="28"></uni-icons>
				<text>客服</text>
			</view>
			<view class="nav-addcart">
				<view class="nav-addcart-btn" @click="openBuyGoods">加入购物车</view>
				<view class="nav-get-discounts" @click="getDiscounts">领劵购买</view>
			</view>
		</view>
		<!-- 底部导航 -->

		<!-- 底部弹出的保障信息窗口 -->
		<uni-popup ref="safePopup" type="bottom">
			<Safeguard :safeList="curgoods.safeguardList" @colseSafePopup="colseSafePopupMethod"></Safeguard>
		</uni-popup>
		<!-- 底部弹出的保障信息窗口 -->
		
		<!-- 底部弹出选择购买商品的详细信息 -->
		<uni-popup ref="buyGoodsPopup" type="bottom">
			<BuyGoodsInfo :curgoods="curgoods" :curcartlist="cartlist" @colsebuyGoodsPopup="colsebuyGoodsPopupMethod"></BuyGoodsInfo>
		</uni-popup>
		<!-- 底部弹出选择购买商品的详细信息 -->
	</view>
</template>

<script>
	/**
	 * 实现思路
	 * 1.获得当前商品id
	 * 2.加载当前商品信息
	 * 3.加载当前商品相关的信息
	 */
	import Safeguard from '@/components/Safeguard/Safeguard.vue'
	import Evaluate from '@/components/Evaluate/Evaluate.vue'
	import BuyGoodsInfo from '@/components/BuyGoodsInfo/BuyGoodsInfo.vue'
	const app = getApp({allowDefault: true})
	export default {
		components: {
			Safeguard,
			Evaluate,
			BuyGoodsInfo
		},
		data() {
			return {
				curgoods:{},
				cartlist:[],
				cartAllTotalNums:app.globalData.cartAllTotalNums
			}
		},
		onLoad(options) {
			console.log(options)
			// 获得当前商品信息
			if(app.globalData.curGoods.gid!=undefined && app.globalData.curGoods.gid!=null){
				this.loadCurGoods(app.globalData.curGoods.gid)
			}
			else{
				this.loadCurGoods(options.gid)
			}
		    this.loadCart()
		},
		methods: {
			loadCart() {
				// 加载购物车的数据
				this.cartlist = app.globalData.cartList
				// 发送请求
				uni.request({
					url: app.globalData.baseUrl+'cart/getcartlist/' + app.globalData.cid,
					success: (res) => {
						if(res.data.statusCode==200){
							this.cartlist = res.data.mydata
							app.globalData.cartAllTotalNums = 0
							this.cartlist.forEach((item, index) => {
								app.globalData.cartAllTotalNums += item.goodsDetail.length
							})
							this.cartAllTotalNums = app.globalData.cartAllTotalNums
				            // console.log(this.cartlist )
						}
					}
				})
			},
			// 加载当前商品的所有数据
			loadCurGoods(gid){
				/**
				 * 实现思路
				 * 1.获得当前商品id
				 * 2.加载当前商品信息
				 * 3.加载当前商品相关的信息
				 */
				//2.加载当前商品信息
				uni.request({
					url:app.globalData.baseUrl + 'goods/getcurgoodsinfo/'+ gid,
					success: (res) => {
						if(res.data.statusCode==200)
						{
							this.curgoods = res.data.mydata
							app.globalData.curGoods = this.curgoods
							this.curgoods.icons = this.curgoods.icon.split(";")
						}
						//console.log(res)
					}
				})
				
			},
			openHome(){
				uni.switchTab({
					url:"../index/index"
				})
			},
			openCart(){
				uni.switchTab({
					url:"../cart/cart?cartAllTotalNums="+this.cartAllTotalNums
				})
			},
			openSafe() {
				this.$refs.safePopup.open('bottom')
			},
			openBuyGoods(){
				this.$refs.buyGoodsPopup.open('bottom')
			},
			getDiscounts(){
				this.openBuyGoods()
			},
			colsebuyGoodsPopupMethod(data){
				if(data!=undefined)
				   this.cartAllTotalNums = data
				  
				this.$refs.buyGoodsPopup.close()
			},
			colseSafePopupMethod(){
				 this.$refs.safePopup.close()
			}
		}
	}
</script>

<style lang="scss">
	page{
		padding: 0;
	}
	.goodsswiper {
		width: 100%;
		height: 500rpx;

		image {
			width: 100%;
			height: 100%;
		}
	}

	.container {
		padding: 0 20rpx;

		.container-moudle {
			width: 100%;
			background-color: #FFF;
			margin: 10px auto;
			padding: 20rpx;
			box-sizing: border-box;
			border-radius: 15rpx;
		}

		.goods-price-name {
			height: 180rpx;

			.goods-price {
				height: 50rpx;
				display: flex;
				color: #EE425A;
				font-size: 24rpx;
				font-weight: 500;
				margin: 5rpx auto;
				line-height: 50rpx;
				justify-content: space-between;

				.goods-price-parent {
					display: flex;

					.danwei {
						transform: scale(0.9);
						line-height: 64rpx;
					}

					.my-price {
						font-size: 38rpx;
						font-weight: bold;
						padding: 0 3rpx;
					}
				}

				.my-selltotalnum {
					transform: scale(0.8);
					color: #999;
					padding-left: 4rpx;
					letter-spacing: 2rpx;
					line-height: 64rpx;
				}

			}

			.goods-title {
				font-size: 28rpx;
				font-weight: bold;
				color: #555;
			}
		}

		.showArrow {
			width: 50rpx;
			text-align: right;
		}

		.goods-select {
			height: 300rpx;

			.goods-select-p {
				display: flex;
				justify-content: space-between;
				margin-bottom: 35rpx;

				.goods-select-type {
					width: 70rpx;
				}

				.goods-select-title {
					flex-grow: 1;
					color: #333;
					position: relative;

					.goods-select-left {
						position: absolute;
						top: -7rpx;
						left: 0;
						width: 100%;
						height: 50rpx;
						display: flex;
						overflow: hidden;
						z-index: 9;

						.goods-select-left-pics-item {
							max-width: 90rpx;
							height: 50rpx;
							border-radius: 10rpx;
							margin-right: 8rpx;
						}

						.goods-select-left-gname {
							height: 50rpx;
							background-color: #E8E9EE;
							border-radius: 10rpx;
							line-height: 50rpx;
							white-space: nowrap;
							margin-right: 8rpx;
						}
					}

					.goods-select-text {
						width: 100%;
						height: 50rpx;
						position: absolute;
						top: -7rpx;
						right: 0;
						z-index: 10;
						background-image: linear-gradient(to right, transparent 10%, #FFF 90%);
						text-align: right;
						line-height: 50rpx;
					}


				}

			}
		}

		.shops {
			height: 300rpx;
			background-color: #ECEDF1;
			background-color: linear-gradient(#E8E9EE, #EEEFF4);
			border-radius: 20rpx 20rpx 0 0;
		}

		.shops-recommend {
			height: 400rpx;
			background-color: #FFF;
			border-radius: 0px;
		}

		.curgoodsinfo {
			height: 400rpx;
			background-color: #FFF;
		}
	}

	.footer {
	  width: 100vw; /* 使用视口宽度，不受父容器影响 */
	  height: 60px;
	  background-color: #FFF;
	  position: fixed;
	  bottom: 0;
	  left: 0;
	  z-index: 999; /* 确保在最上层 */
	  display: flex;
	  justify-content: space-around;
	  align-items: center;
	  box-sizing: border-box; /* 避免 padding 导致宽度溢出 */
	}

		.nav-item {
			width: 110rpx;
			height: 50px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			line-height: 20px;
			position: relative;

			.cart-num {
				padding: 1rpx;
				border-radius: 14rpx;
				background-color: #EE425A;
				color: #FFF;
				position: absolute;
				top: 0;
				right: 14rpx;
				text-align: center;
				line-height: 28rpx;
			}
		}

		.nav-addcart {
			flex-grow: 1;
			display: flex;
			justify-content: center;
			font-weight: bold;
			text-align: center;
			line-height: 40px;
			font-size: 30rpx;

			.nav-addcart-btn {
				width: 45%;
				height: 40px;
				border-radius: 20rpx 0 0 20rpx;
				background-color: #FEF5F6;
				color: #FE4A6D;
			}

			.nav-get-discounts {
				width: 45%;
				height: 40px;
				border-radius: 0 20rpx 20rpx 0;
				background-color: #FE4A6D;
				color: #FFF;
			}
		}


</style>
