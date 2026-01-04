<template>
	<view class="line"></view>
	<!-- 地址 -->
	<view class="address-parent">
		<view class="mapimg">
			<uni-icons customPrefix="iconfont" type="icon-ditu-dibiao" size="24" color="#AAA"></uni-icons>
		</view>
		<view class="address">
			<view class="address-province">
				{{address.province}}
			</view>
			<view class="address-detailaddress">
				{{address.detailaddress}}
			</view>
			<view class="address-name-tel">
				<text class="address-name">
					{{address.receiveName}}
				</text>
				<text class="address-tel">
					{{address.tel}}
				</text>
			</view>
		</view>
		<view class="forward">
			<uni-icons type="forward" size="20" color="#999"></uni-icons>
		</view>
	</view>
	<!-- 地址 -->
	<view class="bgline"></view>
	<!-- 购买的商品列表 -->
	<view class="buygoodslist" v-for="(item,index) in curNewOrders">
		<view class="buygoodslist-shop">
			<image :src="item.shop.slogo" v-if="item.shop.slogo!='' && item.shop.slogo!=null"></image>
			<uni-icons type="shop" size="28" v-else></uni-icons>
			<text>{{item.shop.sname}}</text>
		</view>
		<view class="buygoodslist-curgoods" v-for="(ditem,index) in item.goodsDetail">
			<image :src="ditem.icon" class="curgoods-img"></image>
			<view class="buygoodslist-curgoods-content">
				<view class="curgoods-content-gname">
					{{ditem.gname}}
				</view>
				<view class="curgoods-content-text">
					{{ditem.bcontent}}
				</view>
				<view class="curgoods-content-rest" v-if="item.restBuyNum>0">
					限购{{item.restBuyNum}}件
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
		</view>
		<view class="buygoodslist-postprice">
			<text>订单运费</text>
			<text v-if="item.postprice==null || item.postprice==0 " class="buygoodslist-postprice-baoyou">包邮</text>
			<text v-else>￥ {{item.postprice}}</text>
		</view>
		<view class="buygoodslist-liuyan">
			<text>订单留言</text>
			<input class="buygoodslist-liuyan-input" placeholder="选填,建议先与商家协商一致" v-model="item.beizhu"/>
		</view>
	</view>
	<!-- 购买的商品列表 -->
	
	<!-- 合计价格 -->
	<view class="totalPrice">
		<view class="totalPrice-price">
			<text>订单金额</text>
			<text class="totalPrice-price-item">￥{{totalPrice}}</text>
		</view>
		<view class="totalPrice-dis">
			<text>优惠劵</text>
			<view class="totalPrice-dis-content">
				<!-- <view class="totalPrice-dis-use">共使用2张</view>
				<text class="totalPrice-dis-useprice">-￥{{discountsNum}}</text> -->
			</view>
		</view>
	</view>
	<!-- 合计价格 -->
	
	<view style="width: 400rpx;height: 150rpx;"></view>
	<!-- 底部提交订单 -->
	<view class="footer">
		<view class="totalprice">
			<view class="my-integer-price">￥{{parseInt(totalPrice-discountsNum)}}</view>
			<view class="my-decimal-price">{{getDecimal((totalPrice-discountsNum).toFixed(2))}}</view>
		</view>
		<view class="btn" @click="clickSubmitOrders">
			提交订单
		</view>
	</view>
	<!-- 底部提交订单 -->
</template>

<script>
	import fDate from "@/common/utils/formatDateUtil.js"
	const app = getApp({allowDefault: true})
	export default {
		data() {
			return {
				curNewOrders:[],
				address:{
					province:'河北省 邯郸市',
					detailaddress:'河北工程大学',
					receiveName:'邓酩钢',
					tel:'15033891897'
				},
				totalPrice:0,
				discountsNum:0
			}
		},
		onLoad(options) {
			// console.log(app.globalData.neworders)
			if(app.globalData.neworders!=undefined && app.globalData.neworders!=null){
				this.curNewOrders = app.globalData.neworders
			}
			// 计算所有的价格
			this.computerTotalPrice();
		},
		methods: {
			computerTotalPrice(){
				this.totalPrice = 0
				this.curNewOrders.forEach(item=>{
					this.totalPrice += parseFloat(item.buyTotalPrice) + item.postprice
				})
				this.totalPrice = this.totalPrice.toFixed(2)
			},
			getDecimal(price) {
				let att = (price + '').split('.')
				if (att.length > 1) {
					return '.' + att[1]
				} else {
					return ''
				}
			},
			clickSubmitOrders(){
				// 一个门店一个订单
				let orderlist = []
				this.curNewOrders.forEach(item=>{
					// 订单主信息
					let orders = {}
					orders = item
					orders.orderid = orders.cid + new Date().getTime()+parseInt((Math.random()*100)*(Math.random()*100));
					orders.ordertime = fDate.formatTime(new Date())
					orders.paytime = null
					orders.orderstatus = 0
					orders.orderstatusStr = '待支付'
					orders.buyTotalPrice = orders.buyTotalPrice - this.discountsNum
					
					
					// 订单详细信息
					let ordersDetail = item.goodsDetail
					ordersDetail.forEach(ditem=>{
						ditem.orderid = item.orderid
						ditem.odid = 0
					})
					orders.ordersDetail = ordersDetail
					
					Reflect.deleteProperty(orders, 'goodsDetail')
					Reflect.deleteProperty(orders, 'checked')
					// 添加订单
					orderlist.push(orders)
				})
				
				// 远程提交订单。。。。
				uni.request({
					url: app.globalData.baseUrl + 'orders/addorders',
					method:"POST",
					data:orderlist,
					success: (res) => {
						console.log(res)
						// 转向订单页面
						uni.switchTab({
							url:'../orders/orders'
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		padding: 0;
	}

	.line {
		border: 1rpx solid #E4E4E4;
	}

	.address-parent {
		width: 100%;
		height: 230rpx;
		padding: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #FFF;
		
		.mapimg,.forward{
			width: 90rpx;
			text-align: center;
		}
		.address{
			flex-grow: 1;
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: space-evenly;
			.address-province{
				font-size: 28rpx;
			}
			.address-detailaddress{
				font-size: 32rpx;
				font-weight: bold;
				color: #555;
			}
			.address-name-tel{
				font-size: 28rpx;
				color: #555;
			}
		}
	}

	.bgline{
		width: 100%;
		height: 34rpx;
		background-color: #F6F6F8;
		background-image: url('http://www.itlaobing.com/douyin/other/bgline.png');
		background-repeat: repeat-x;
	}

	.buygoodslist{
		width: 100%;
		margin-bottom: 20rpx;
		padding: 30rpx;
		box-sizing: border-box;
		background-color: #FFF;
		
		.buygoodslist-shop{
			font-size: 32rpx;
			display: flex;
			align-items: center;
		}
		
		.buygoodslist-curgoods{
			display: flex;
			padding: 30rpx 0;
			
			.curgoods-img{
				width: 230rpx;
				height: 230rpx;
				border-radius: 5rpx;
				flex-shrink: 0;
			}
			.buygoodslist-curgoods-content{
				padding-left: 20rpx;
				box-sizing: border-box;
				height: 300rpx;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				
				.curgoods-content-gname{
					font-size: 30rpx;
					color: #333;
					font-weight: bold;
				}
				.curgoods-content-text{
					color: #777;
				}
				.curgoods-content-rest{
					color: #F07941;
					font-size: 26rpx;
				}
				.curgoods-content-price{
					display: flex;
					justify-content: space-between;
					font-weight: bold;
					.danwei{
						font-size: 24rpx;
					}
					.price{
						font-size: 34rpx;
						color: #333;
					}
					.buynums{
						font-size: 30rpx;
						color: #333;
					}
				}
			}
		}
		.buygoodslist-postprice{
			display: flex;
			justify-content: space-between;
			font-size: 26rpx;
			height: 60rpx;
			
			.buygoodslist-postprice-baoyou{
				font-weight: bold;
			}
		}
		.buygoodslist-liuyan{
			display: flex;
			justify-content: space-between;
			height: 60rpx;
			
			.buygoodslist-liuyan-input{
				width: 70%;
				border-bottom: 2rpx solid #EEE;
				color: #AAA;
				text-align: right;
			}
		}
	}

	.totalPrice{
		width: 100%;
		height: 180rpx;
		background-color: #FFF;
		margin: 20rpx 0;
		box-sizing: border-box;
		padding: 30rpx 30rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		
		.totalPrice-price{
			display: flex;
			justify-content: space-between;
			
			.totalPrice-price-item{
				font-weight: bold;
				font-size: 26rpx;
				color: #333;
			}
		}
		.totalPrice-dis{
			display: flex;
			justify-content: space-between;
			align-items: center;
			
			.totalPrice-dis-content{
				display: flex;
				justify-content: flex-end;
				align-items: center;
				
				.totalPrice-dis-use{
					padding: 10rpx;
					background-color: #EEE;
					margin-right: 10rpx;
				}
				.totalPrice-dis-useprice{
					color:#EE425A;
					font-weight: bold;
					font-size: 26rpx;
				}
			}
		}
	}

	.footer{
		width: 100%;
		height: 130rpx;
		background-color: #FFF;
		position: fixed;
		bottom: 0;
		left: 0;
		display: flex;
		justify-content: space-between;
		box-sizing: border-box;
		padding: 20rpx 30rpx;
		border-top: 1rpx solid #EEE;
		
		.totalprice{
			color: #EE425A;
			font-size: 40rpx;
			line-height: 90rpx;
			display: flex;
			letter-spacing: 0rpx;
			font-weight: bold;
			.my-decimal-price {
				font-size: 25rpx;
				line-height: 100rpx;
			}
		}
		
		.btn{
			width: 220rpx;
			height: 90rpx;
			background-color: #EE425A;
			color: #FFF;
			text-align: center;
			line-height: 90rpx;
			font-weight: bold;
			font-size: 28rpx;
		}
	}
</style>
