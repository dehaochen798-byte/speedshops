<template>
  <view class="my_header">
    <image src="/static/other/headerimg.png" class="headerimg"></image>
    <view class="denglu_username">{{ loginUser }}</view>
  </view>

  <view
    class="itemlist"
    v-for="(item, index) in itemlist"
    :key="index"
    :data-itemid="item.id"
    @click="selectItem"
  >
    <image :src="item.icon" class="iconimg"></image>
    <view class="itemtitle">{{ item.title }}</view>
    <view class="arrow">></view>
  </view>
</template>

<script>
const app = getApp({
  allowDefault: true,
});
export default {
  data() {
    return {
      // 初始化为空，后续动态生成
      itemlist: [],
      isLogin: app.globalData.isLogin,
      loginUser: "",
    };
  },
  onShow() {
    // 页面显示时，先更新用户信息，再更新列表（包含商品添加的权限判断）
    this.updateUserInfoFromToken();
    this.updateItemListByUserState();
  },
  methods: {
    // 从 token/缓存 获取并更新用户名
    updateUserInfoFromToken() {
      const token = uni.getStorageSync("token");
      if (token) {
        // 统一用uni的存储API（兼容多端，替代localStorage）
        this.loginUser = uni.getStorageSync("nickname") || "";
      } else {
        this.loginUser = "";
      }
    },

    // 核心：根据userState动态生成列表（控制商品添加是否显示）
    updateItemListByUserState() {
      // 1. 获取本地存储的userState（注意：统一用uni.getStorageSync兼容多端）
      const userState = uni.getStorageSync("userState");

      // 2. 基础列表（所有用户都显示的项）
      const baseItemList = [
        {
          id: 1,
          icon: "/static/other/icon01.png",
          title: "个人信息",
        },
        {
          id: 5,
          icon: "/static/other/icon05.png",
          title: "退出登录",
        },
      ];

      // 3. 判断userState，决定是否添加“商品添加”项
      // - userState为0（管理员）显示，其他不显示
      if (userState === "0") {
        // 在“个人信息”和“退出登录”之间插入“商品添加”
        baseItemList.splice(1, 0, {
          id: 2,
          icon: "/static/other/icon03.png",
          title: "商品添加",
        });
      }

      // 4. 赋值给页面列表
      this.itemlist = baseItemList;
    },

    selectItem(arg) {
      let itemid = arg.currentTarget.dataset.itemid;
      switch (itemid) {
        case 1:
          uni.navigateTo({
            url: "/pages/my/accountInfo",
          });
          break;
        case 2:
          uni.navigateTo({
            url: "/pages/my/accountInfo",
          });
          break;
        case 5:
          uni.showModal({
            title: "确认退出",
            content: "确定要退出当前账号吗？",
            confirmText: "退出",
            cancelText: "取消",
            success: (res) => {
              if (res.confirm) {
                app.globalData.isLogin = false;
                this.isLogin = false;

                // 清除所有用户相关存储
                uni.removeStorageSync("token");
                uni.removeStorageSync("nickname");
                uni.removeStorageSync("cid");
                uni.removeStorageSync("userState"); // 同时清除userState

                this.loginUser = "";
                // 退出后刷新列表（商品添加会自动隐藏）
                this.updateItemListByUserState();

                uni.showToast({
                  title: "退出成功",
                  icon: "success",
                  duration: 1500,
                });

                setTimeout(() => {
                  uni.reLaunch({
                    url: "/pages/starter/starter",
                  });
                }, 1500);
              }
            },
          });
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.my_header {
  width: 100%;
  height: 430rpx;
  background-color: #fff;
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
    color: #fff;
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
  background-color: #fff;
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
    color: #ccc;
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
      border: 2rpx solid #ccc;
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
    color: #fff;
    text-align: center;
    line-height: 75rpx;
  }
}
</style>
