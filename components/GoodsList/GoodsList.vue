<template>
  <view class="goodslistparent">
    <view
      class="goodsitem"
      v-for="(item, index) in goodslist"
      @click="clickgoodsitem(item)"
    >
      <!-- 右上角齿轮图标 -->
      <view class="gear-icon" @click.stop="openGoodsEditForm(item)">
        <uni-icons type="gear" size="32rpx" color="#666"></uni-icons>
      </view>

      <image :src="item.icon" class="firstimg"></image>
      <view class="gname">{{ item.gname }}</view>
      <view class="discountsparent" v-if="item.discounts != ''">
        <view class="discounts">{{ item.discounts }}</view>
        <view class="other"></view>
      </view>
      <view class="priceparent">
        <text class="danwei">￥</text>
        <text class="price">{{ item.price }}</text>
        <text class="sellTotalNum">已售{{ item.sellTotalNum }}件</text>
      </view>
    </view>
  </view>
</template>

<script>
const app = getApp({ allowDefault: true });
export default {
  name: "GoodsList",
  data() {
    return {
      goodslist: [],
    };
  },
  // 生命周期函数
  created() {
    this.loadGoodsList();
  },

  methods: {
    // 点击当前商品，转向商品详细页面
    clickgoodsitem(item) {
      // 1. 保存当前商品信息
      app.globalData.curGoods = item;
      // 2. 转向商品详细页面
      uni.navigateTo({
        url: "/pages/goods/goods?gid=" + item.gid,
      });
    },
    // 根据搜索关键字，查询商品列表
    searchKeyWord(keyword) {
      if (keyword == undefined || keyword.trim() == "") return;

      // 发送搜索请求
      uni.request({
        url: app.globalData.baseUrl + "goods/findbykeyword/" + keyword,
        success: (res) => {
          if (res.data.statusCode == 200) {
            this.goodslist = res.data.mydata;
            // console.log(this.goodslist)
          }
          // console.log(res)
        },
      });
    },
    // 去远程加载商品列表
    loadGoodsList(cgid) {
      let myurl = app.globalData.baseUrl + "goods/findbycgid/" + cgid;
      if (cgid == undefined || cgid == "")
        myurl = app.globalData.baseUrl + "goods/findbycgid";

      uni.request({
        url: myurl,
        success: (res) => {
          if (res.data.statusCode == 200) {
            this.goodslist = res.data.mydata;
            // console.log(this.goodslist)
          }
          // console.log(res)
        },
      });
    },
    openGoodsEditForm(item) {
      // 1. 保存当前商品信息
      app.globalData.curGoods = item;
      // 2. 转向商品编辑页面，传递gid参数
      console.log("点击了齿轮，要修改的商品是：", item);
      uni.navigateTo({
        url: "/pages/goods/goodsEdit?gid=" + item.gid,
      });
    },
  },
};
</script>

<style lang="scss">
.goodslistparent {
  width: 95%;
  height: auto;
  margin: 20rpx auto;
  column-count: 2;
  column-gap: 20rpx;
  font-size: 24rpx;
  color: #777;

  .goodsitem {
    width: 100%;
    height: auto;
    background-color: #fff;
    break-inside: avoid;
    margin-bottom: 20rpx;
    border-radius: 20rpx;
    overflow: hidden;
    /* 新增：让齿轮相对于商品项定位 */
    position: relative;

    /* 新增：齿轮图标的样式 */
    .gear-icon {
      position: absolute;
      top: 15rpx; /* 距离顶部15rpx */
      right: 15rpx; /* 距离右侧15rpx */
      z-index: 10; /* 确保在最上层，不被图片遮挡 */
      background-color: rgba(255, 255, 255, 0.8); /* 半透明白底，提升辨识度 */
      padding: 8rpx;
      border-radius: 50%; /* 圆形背景 */
    }

    .firstimg {
      width: 100%;
      height: 320rpx;
    }
    .gname {
      font-size: 26rpx;
      padding: 20rpx;
    }
    .discountsparent {
      display: flex;
      .discounts {
        border: 2rpx solid red;
        width: auto;
        max-width: 230rpx;
        min-width: 170rpx;
        height: 50rpx;
        text-align: center;
        line-height: 50rpx;
        padding: 0 10rpx;
        margin-left: 20rpx;
        white-space: nowrap;
        border-radius: 10rpx;
      }
    }
    .priceparent {
      display: flex;
      align-items: baseline;
      margin-left: 20rpx;
      margin-bottom: 40rpx;
      margin-top: 15rpx;
      .danwei {
        color: red;
        font-size: 24rpx;
      }
      .price {
        color: red;
        font-size: 34rpx;
      }
      .sellTotalNum {
        color: #999;
        padding-left: 6rpx;
      }
    }
  }
}
</style>
