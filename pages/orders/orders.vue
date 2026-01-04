<template>
	<view class="orders-page">
	<view style="width: 50%;height: 70rpx;"></view>
	<!-- 头部 -->
	<view class="header-search">
		<view class="header-search-back">
			<uni-icons type="back" size="24" color="#999999" @click="back"></uni-icons>
			<view class="header-search-box">
				<uni-icons type="search" size="24" click="#EEEEEE" style="margin-right: 15rpx;"></uni-icons>
				<input type="text" class="header-search-input" />
			</view>
		</view>
		<text class="dian">...</text>
	</view>
	<!-- 头部 -->

	<!-- 导航 -->
	<view class="nav">
		<text>全部</text>
		<text>评价</text>
	
	</view>
	<!-- 导航 -->

	<!-- 订单列表 -->
	<view class="buygoodslist" v-for="(item,index) in orderlist" :key="item.orderid">
		<view class="buygoodslist-shop">
			<view>
				<image :src="item.shop.slogo" v-if="item.shop.slogo!=''  && item.shop.slogo!=null"></image>
				<uni-icons type="shop" size="28" v-else></uni-icons>
				<text>{{item.shop.sname}}</text>
			</view>
			<view class="status">
				{{item.orderstatusStr}}
			</view>
		</view>
		<view class="buygoodslist-curgoods" v-for="(ditem,index) in item.ordersDetail" :key="ditem.gdid">
			<image :src="ditem.icon" class="curgoods-img"></image>
			<view class="buygoodslist-curgoods-content">
				<view class="curgoods-content-gname">
					{{ditem.gname}}
				</view>
				<view class="curgoods-content-text">
					{{ditem.bcontent}}
				</view>
			</view>
			<view class="curgoods-content-price">
				<view>
					<text class="danwei">￥</text>
					<text class="price">{{ditem.buyPrice}}</text>
				</view>
				<view>
					<text class="danwei">X</text>
					<text class="buynums">{{ditem.buyNums}}</text>
				</view>
			</view>
		</view>

		<view class="fahuo">
			<text class="fahuo-xianhuo">现货</text> 1小时内配送到
		</view>

		<view class="totalprice">
			<text v-if="item.orderstatus==0">需</text>
			<text v-else-if="item.orderstatus==1||item.orderstatus==2">实</text>
			<text v-else>应</text>
			<text>付款￥{{(item.buyTotalPrice + item.postprice).toFixed(2)}}</text>
		</view>

		<!-- 操作按钮 -->
		<view class="contrllerbtn" v-show="item.orderstatus==0">
			<!--0. 待支付操作按钮 -->
			<view class="btn" @click="clickCancelorders(item)">取消订单</view>
			<view class="btn">修改地址</view>
			<view class="btn weizhifubtn" @click="clickPayOrders(item)">去支付
				<!-- 不显示天数 -->
				<uni-countdown :font-size="12" :show-day="false" :hour="0" :minute="4" :second="0" :show-colon="true"
					@timeup="timeup(item)" splitorColor="#FFFFFF" color="#FFFFFF"></uni-countdown>
			</view>
			<!-- 待支付操作按钮 -->
		</view>

		<view class="contrllerbtn" v-show="item.orderstatus==1">
			<!-- 1.已支付 操作按钮 -->
			<view class="btn" @click="addcart(item)">加入购物车</view>
			<view class="btn">查看物流</view>
			<view class="btn pingjiabtn">评价</view>
			<!-- 1.已支付操作按钮 -->
		</view>

		<view class="contrllerbtn" v-show="item.orderstatus==2">
			<!-- 2.交易成功操作按钮 -->
			<view class="btn" @click="addcart(item)">加入购物车</view>
			<view class="btn">查看物流</view>
			<view class="btn">追加评价</view>
			<!-- 2.交易成功操作按钮 -->
		</view>

		<view class="contrllerbtn" v-show="item.orderstatus==3 || item.orderstatus==4">
			<!--  3.已取消 4.退单操作按钮 -->
			<view class="btn" @click="clickDelorders(item)">删除订单</view>
			<view class="btn" @click="addcart(item)">加入购物车</view>
			<!--  3.已取消 4.退单操作按钮 -->
		</view>
		<!-- 操作按钮 -->
	</view>
	<!-- 订单列表 -->


</view>
</template>

<script>
	import fDate from "@/common/utils/formatDateUtil.js"
	const app = getApp({
		allowDefault: true
	})
	export default {
		data() {
			return {
				orderlist: []
			}
		},
		onShow() {
			this.loadOrders(1)
		},
		methods: {
			back() {
				uni.switchTab({
					url: '../index/index'
				})
			},
			// 去支付
			clickPayOrders(curOrder) {
				// 更新订单
				this.orderlist.forEach(item => {
					if (item.orderid == curOrder.orderid) {
						item.orderstatus = 1
						item.orderstatusStr = "已支付"
						item.paytime = fDate.formatTime(new Date())
					}
				})
				// 远程更新订单
				uni.request({
					url: app.globalData.baseUrl + 'orders/updateorders',
					method: 'POST',
					data: curOrder,
					success: (result) => {
						if (result.data.statusCode === 200) {
						    // 延迟更新数据，等待 DOM 就绪
						    this.$nextTick(() => {
						      this.orderList = result.data.mydata; // 假设渲染列表为 orderList
						    });
						  }
					}
				})
			},
			addcart(curOrder) {
				// 获得原来的购物车
				let cartlist = []
				// 远程获得原来的购物车
				if(cartlist.length==0)
				{
					this.loadCartList(cartlist,curOrder)
				}
				else{
					//添加新购物车数据
					this.addNewCart(cartlist, curOrder)
				}
				
			},
			// 远程获得当前客户的购物车列表
			loadCartList(cartlist,curOrder){
				// 发送请求
				uni.request({
					url: app.globalData.baseUrl+'cart/getcartlist/' + app.globalData.cid,
					success: (res) => {
						if(res.data.statusCode==200){
							// console.log("aaaaaaaaa")
							cartlist = res.data.mydata
						}
						else{
							cartlist = []
						}
						//添加新购物车数据
						this.addNewCart(cartlist, curOrder)
					}
				})
			},
			/**
			 * 添加新购物车数据
			 * @param {Object} cartlist
			 * @param {Object} curOrder
			 */
			addNewCart(cartlist, curOrder) {
				//======================== 如果购物车存在此商品，数量增加===========================
				let isFind = false
				let isFindNums = 0
				let curcartitem = {}
				
				cartlist.forEach(cartitem => {
					// 查找当前店铺
					if (cartitem.sid == curOrder.sid) {
						isFind = true
						curcartitem = cartitem
						cartitem.goodsDetail.forEach(gitem => {
							curOrder.ordersDetail.forEach(orderitem => {
								//如果购物车存在此商品，数量增加
								if (gitem.gdid == orderitem.gdid) {
									gitem.buyNums += orderitem.buyNums
									orderitem.isFind = true
									isFindNums++
								}
							})
						})
					}
				})
				// 购物车中当前店铺没有此商品的，就添加此商品
				if (isFind == true && isFindNums < curOrder.ordersDetail.length) {
					curOrder.ordersDetail.forEach(orderitem => {
						if (orderitem.isFind != true) {
							curcartitem.goodsDetail.push(orderitem)
						}
					})
				}
				if (isFind == false) { // 没有找到
					let cart = {
						beizhu: curOrder.beizhu,
						buyTotalNums: curOrder.buyTotalNums,
						buyTotalPrice: curOrder.buyTotalPrice,
						cartid: null,
						cid: curOrder.cid,
						goodsDetail: curOrder.ordersDetail,
						postprice: curOrder.postprice,
						shop: curOrder.shop,
						sid: curOrder.sid
					}
					cartlist.push(cart)
				}

				//合计购物车的总价格
				this.compterCartList(cartlist)

				// 远程更新购物车
				uni.request({
					url: app.globalData.baseUrl + 'cart/updatecartlist',
					method: "POST",
					data: cartlist,
					dataType: 'json',
					success: (result) => {
						if (result.data.statusCode === 200) {
						    // 延迟更新数据，等待 DOM 就绪
						    this.$nextTick(() => {
						      this.ordersList = result.data.mydata; // 假设渲染列表为 ordersList
						    });
						  }
						// app.globalData.cartList = result.data.mydata
						// 转向购物车页面
						uni.switchTab({
							url: "../cart/cart"
						})
					}
				})

			},
			//合计购物车的总价格
			compterCartList(cartlist) {
				cartlist.forEach(curCart => {
					let priceSum = 0
					let numSum = 0
					curCart.goodsDetail.forEach(ditem => {
						priceSum += ditem.buyNums * ditem.buyPrice
						numSum += ditem.buyNums
					})
					curCart.buyTotalPrice = priceSum
					curCart.buyTotalNums = numSum
				})
			},
			loadOrders(pageindex) {
				
				uni.request({
					url: app.globalData.baseUrl + 'orders/getorderslist/' + app.globalData.cid + '/' + pageindex,
					success: (res) => {
						console.log("orderlist:",res)
						if (res.data.statusCode == 200) {
							this.orderlist = res.data.mydata
						}
					}
				})
			},
			clickDelorders(curOrder) {
				let that = this
				//弹出提示信息
				uni.showModal({
					title: "温馨提示",
					content: '你确定要删除订单吗？',
					showCancel: true,
					success: function(res) {
						if (res.confirm) {
							that.delorders(curOrder)
						} else if (res.cancel) {
							return
						}
					}
				})
			},
			delorders(curOrder) {
				// 删除订单
				this.orderlist = this.orderlist.filter(item => item.orderid !== curOrder.orderid)
				// 远程删除订单
				uni.request({
					url: app.globalData.baseUrl + "orders/delorders/" + curOrder.orderid,
					success: (res) => {

					}
				})

			},
			timeup(curOrder) {
			  this.$nextTick(() => {
			    this.cancelorders(curOrder) // 延迟执行状态修改
			    uni.showToast({ title: "支付时间超时，订单已取消", duration: 4000 })
			  })
			},
			clickCancelorders(curOrder) {
				let that = this
				//弹出提示信息
				uni.showModal({
					title: "温馨提示",
					content: '你确定要取消订单吗？',
					showCancel: true,
					success: function(res) {
						if (res.confirm) {
							that.cancelorders(curOrder)
						} else if (res.cancel) {
							return
						}
					}
				})
			},
			cancelorders(curOrder) {
				// 更新订单
				this.orderlist = this.orderlist.map(item => {
				    if (item.orderid === curOrder.orderid) {
				      return { ...item, orderstatus: 3, orderstatusStr: "已取消", paytime: "" }
				    }
				    return item
				  })
				// 远程更新订单
				uni.request({
					url: app.globalData.baseUrl + 'orders/updateorders',
					method: 'POST',
					data: curOrder,
					success: (result) => {
						if (result.data.statusCode === 200) {
						    // 延迟更新数据，等待 DOM 就绪
						    this.$nextTick(() => {
						      this.ordersList = result.data.mydata; // 假设渲染列表为 ordersList
						    });
						  }
						// app.globalData.cartList = result.data.mydata
					}
				})

			}
		}
	}
</script>

<style lang="scss">
	.header-search {
		width: 95%;
		margin: 0 auto;
		box-sizing: border-box;
		// padding: 20rpx;
		display: flex;
		justify-content: space-between;

		.header-search-back {
			display: flex;
			width: 550rpx;
			justify-content: space-between;
			align-items: center;

			.header-search-box {
				width: 450rpx;
				height: 66rpx;
				background-color: #EAEEEE;
				border-radius: 10rpx;
				padding: 0rpx 20rpx;
				display: flex;
				align-items: center;
			}
		}

		.dian {
			font-size: 40rpx;
		}
	}

	.nav {
		width: 95%;
		height: 70rpx;
		margin: 20rpx auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 30rpx;

		.active {
			font-size: 36rpx;
			font-weight: bold;
			line-height: 70rpx;
		}

		.active::after {
			content: "";
			width: 80rpx;
			height: 4rpx;
			background-color: #F36C8A;
			display: block;
			margin: 0rpx auto;
		}
	}

	.buygoodslist {
		width: 100%;
		margin-bottom: 20rpx;
		padding: 30rpx;
		box-sizing: border-box;
		background-color: #FFF;
		border-radius: 20rpx;

		.buygoodslist-shop {
			font-size: 30rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.status {
				color: #F36C8A;
			}
		}

		.buygoodslist-curgoods {
			display: flex;
			padding: 30rpx 0;

			.curgoods-img {
				width: 230rpx;
				height: 230rpx;
				border-radius: 5rpx;
				flex-shrink: 0;
			}

			.buygoodslist-curgoods-content {
				padding-left: 20rpx;
				box-sizing: border-box;
				height: 230rpx;
				display: flex;
				flex-direction: column;
				justify-content: space-between;

				.curgoods-content-gname {
					font-size: 30rpx;
					color: #555;
					font-weight: bold;
				}

				.curgoods-content-text {
					color: #777;
				}

			}

			.curgoods-content-price {
				display: flex;
				justify-content: flex-start;
				flex-direction: column;
				font-weight: bold;
				text-align: right;

				.danwei {
					font-size: 24rpx;
				}

				.price {
					font-size: 34rpx;
					color: #333;
				}

				.buynums {
					font-size: 30rpx;
					color: #333;
				}
			}
		}

		.fahuo {
			width: 100%;
			height: 70rpx;
			background-color: #fAfAfA;
			line-height: 70rpx;
			padding-left: 20rpx;

			.fahuo-xianhuo {
				font-weight: bold;
				font-size: 28rpx;
			}
		}

		.totalprice {
			height: 120rpx;
			text-align: right;
			line-height: 120rpx;
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
		}

		.contrllerbtn {
			width: 100%;
			height: 70rpx;
			display: flex;
			justify-content: flex-end;
			align-items: center;

			.btn {
				min-width: 170rpx;
				height: 66rpx;
				padding: 0 10rpx;
				border: 2rpx solid #CCC;
				border-radius: 10rpx;
				margin-left: 10rpx;
				font-size: 26rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				flex-wrap: nowrap;
			}

			.weizhifubtn {
				background-color: #F36C8A;
				color: #FFF;
			}

			.pingjiabtn {
				border: 2rpx solid orange;
				color: orange;
			}
		}
	}

	.youlike {
		margin: 20rpx 0;
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
	}
</style>