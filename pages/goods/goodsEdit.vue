<template>
  <view class="good-info-page">
    <!-- 页面标题 -->
    <view class="page-header">修改商品</view>

    <!-- 商品添加表单 -->
    <view class="goods-form">
      <!-- 1. 商品名称 -->
      <uni-forms-item label="商品名称" required>
        <uni-easyinput
          v-model="goodsForm.gname"
          placeholder="请输入商品名称（如：香辣方便面）"
          clearable
          @blur="validateGname"
        />
      </uni-forms-item>

      <!-- 2. 商品图片上传 -->
      <uni-forms-item label="商品图片" required>
        <uni-file-picker
          ref="filePickerRef"
          file-mediatype="image"
          mode="grid"
          :limit="1"
          @select="handleImageSelect"
          @delete="handleImageDelete"
        />
      </uni-forms-item>

      <!-- 3. 规格描述 -->
      <uni-forms-item label="规格描述" required>
        <uni-easyinput
          v-model="goodsForm.attributeName1"
          placeholder="请输入规格描述（如：食品口味、手机内存）"
          clearable
          @blur="validateAttrName"
        />
      </uni-forms-item>

      <!-- 表格外层容器：小屏横向滚动 -->
      <uni-forms-item label="规格价格配置" class="spec-form-item">
        <!-- 新增规格行按钮 -->
        <uni-button
          type="primary"
          size="small"
          @click="addSpecRow"
          class="add-row-btn"
        >
          新增规格值
        </uni-button>

        <!-- 横向滚动容器：窗口缩小时底部出现滚动条 -->
        <view class="table-scroll-container">
          <uni-table border stripe :min-width="600">
            <!-- 设置表格最小宽度，触发滚动 -->
            <uni-tr>
              <uni-th>规格值</uni-th>
              <uni-th>原价</uni-th>
              <uni-th>特价</uni-th>
              <uni-th style="width: 120rpx">操作</uni-th>
              <!-- 固定操作列宽度 -->
            </uni-tr>
            <uni-tr v-for="(row, index) in goodsForm.specList" :key="index">
              <uni-td>
                <uni-easyinput
                  v-model="row.attributeValue1"
                  placeholder="如：香辣、128G"
                  @blur="() => validateSpecRow(row)"
                />
              </uni-td>
              <uni-td>
                <uni-easyinput
                  v-model="row.originalPrice"
                  type="number"
                  placeholder="0.00"
                  precision="2"
                />
              </uni-td>
              <uni-td>
                <uni-easyinput
                  v-model="row.specialPrice"
                  type="number"
                  placeholder="0.00"
                  precision="2"
                />
              </uni-td>
              <uni-td>
                <uni-button
                  :type="goodsForm.specList.length <= 1 ? 'default' : 'danger'"
                  size="small"
                  @click="removeSpecRow(index)"
                  :disabled="goodsForm.specList.length <= 1"
                  class="spec-op-btn"
                >
                  {{ goodsForm.specList.length <= 1 ? "至少1个" : "删除" }}
                </uni-button>
              </uni-td>
            </uni-tr>
          </uni-table>
        </view>
      </uni-forms-item>

      <!-- 提交按钮 -->
      <view class="submit-btn-wrap">
        <uni-button
          type="primary"
          size="large"
          @click="submitGoodsForm"
          class="submit-btn"
        >
          提交商品
        </uni-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
export default {
  data() {
    return {
      goodsForm: {
        gname: "",
        icon: "",
        attributeName1: "",
        specList: [
          {
            attributeValue1: "",
            originalPrice: "",
            specialPrice: "",
          },
        ],
      },
    };
  },
  onload(options) {
    if (options.gid) {
      getGoodsDataByGid(options.gid);
    } else {
      uni.switchTab({
        url: "/pages/index/index",
      });
    }
  },
  methods: {
    validateGname() {
      if (!this.goodsForm.gname) {
        uni.showToast({ title: "请输入商品名称", icon: "none" });
        return false;
      }
      if (this.goodsForm.gname.length < 2 || this.goodsForm.gname.length > 50) {
        uni.showToast({ title: "商品名称长度需在2-50字符", icon: "none" });
        return false;
      }
      return true;
    },
    validateAttrName() {
      if (!this.goodsForm.attributeName1) {
        uni.showToast({ title: "请输入规格描述", icon: "none" });
        return false;
      }
      if (this.goodsForm.attributeName1.length > 30) {
        uni.showToast({ title: "规格描述长度不超过30字符", icon: "none" });
        return false;
      }
      return true;
    },
    handleImageSelect(e: any) {
      const file = e.tempFiles[0];
      this.goodsForm.icon = file.tempFilePath || file.url;
    },
    handleImageDelete() {
      this.goodsForm.icon = "";
    },
    addSpecRow() {
      this.goodsForm.specList.push({
        attributeValue1: "",
        originalPrice: "",
        specialPrice: "",
      });
    },
    removeSpecRow(index: number) {
      // 二次校验：防止删空
      if (this.goodsForm.specList.length <= 1) {
        uni.showToast({ title: "至少保留1个规格值哦～", icon: "none" });
        return;
      }
      // 确认删除
      uni.showModal({
        title: "确认删除",
        content: "确定要删除这个规格值吗？删除后无法恢复",
        confirmText: "删除",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            this.goodsForm.specList.splice(index, 1);
            uni.showToast({
              title: "规格值已删除",
              icon: "success",
              duration: 1500,
            });
          }
        },
      });
    },
    validateSpecRow(row: any) {
      if (!row.attributeValue1) {
        uni.showToast({ title: "请填写规格值", icon: "none" });
        return false;
      }
      if (
        !row.originalPrice ||
        isNaN(Number(row.originalPrice)) ||
        Number(row.originalPrice) <= 0
      ) {
        uni.showToast({ title: "请填写有效的原价（大于0）", icon: "none" });
        return false;
      }
      if (
        !row.specialPrice ||
        isNaN(Number(row.specialPrice)) ||
        Number(row.specialPrice) <= 0
      ) {
        uni.showToast({ title: "请填写有效的特价（大于0）", icon: "none" });
        return false;
      }
      if (Number(row.specialPrice) > Number(row.originalPrice)) {
        uni.showToast({ title: "特价不能大于原价", icon: "none" });
        return false;
      }
      return true;
    },
    submitGoodsForm() {
      if (!this.validateGname() || !this.validateAttrName()) return;
      if (!this.goodsForm.icon) {
        uni.showToast({ title: "请上传商品图片", icon: "none" });
        return;
      }
      let specValid = true;
      this.goodsForm.specList.forEach((row) => {
        if (!this.validateSpecRow(row)) specValid = false;
      });
      if (!specValid) return;

      uni.showToast({ title: "提交中...", icon: "loading", duration: 0 });

      const formData = {
        gname: this.goodsForm.gname,
        attributeName1: this.goodsForm.attributeName1,
        // 复杂数组转JSON字符串，后端接收后用JSON.parse解析
        specList: JSON.stringify(
          this.goodsForm.specList.map((row) => ({
            attributeValue1: row.attributeValue1,
            originalPrice: Number(row.originalPrice),
            specialPrice: Number(row.specialPrice),
          }))
        ),
      };

      uni.uploadFile({
        // 你的后端接收表单+图片的接口地址（和后端约定好）
        url: "https://你的服务器域名/api/goods/updata",
        // 图片的临时路径（uni-app自动处理H5/小程序/APP的路径兼容）
        filePath: this.goodsForm.icon,
        // 后端接收图片文件的参数名（必须和后端约定，比如叫file/image）
        name: "file",
        // 普通表单字段放在formData里
        formData: formData,
        // 成功回调
        success: (res) => {
          uni.hideToast(); // 关闭加载
          // 解析后端返回的结果（根据后端格式调整）
          if (!res.data) {
            uni.showToast({ title: "提交失败，没有数据", icon: "none" });
            return;
          }
          const resData = JSON.parse(res.data);
          if (resData.code === 0) {
            uni.showToast({ title: "商品添加成功", icon: "success" });
            this.resetForm(); // 重置表单
          } else {
            uni.showToast({ title: resData.msg || "提交失败", icon: "none" });
          }
        },
        // 失败回调
        fail: (err) => {
          uni.hideToast();
          uni.showToast({ title: "网络错误，提交失败", icon: "none" });
          console.error("表单提交失败：", err);
        },
      });
      console.log("提交数据：", formData);
    },
    resetForm() {
      this.goodsForm.gname = "";
      this.goodsForm.icon = "";
      this.goodsForm.attributeName1 = "";
      this.goodsForm.specList = [
        { attributeValue1: "", originalPrice: "", specialPrice: "" },
      ];
      if (this.$refs.filePickerRef) {
        (this.$refs.filePickerRef as any).clearFiles();
      }
    },
    getGoodsDataByGid(gid: string) {
      uni.request({
        url: app.globalData.baseUrl + "goods/getcurgoodsinfo/" + gid,
        success: (res) => {
          if (res.data.statusCode == 200) {
            this.curgoods = res.data.mydata;
          }
          //console.log(res)
        },
      });
    },
  },
};
</script>

<style scoped>
.good-info-page {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;
}
.page-header {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  text-align: center;
}
.goods-form {
  background-color: #fff;
  overflow: visible !important;
  padding: 20rpx;
  border-radius: 10rpx;
  width: 100%;
  box-sizing: border-box;
}
uni-forms-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 20rpx;
}
uni-forms-item .uni-forms-item__label {
  font-size: 28rpx;
  margin-bottom: 8rpx;
}
uni-easyinput {
  width: 100%;
  font-size: 26rpx;
}
uni-file-picker {
  width: 180rpx;
  height: 180rpx;
  margin: 0 auto;
}
.add-row-btn {
  margin: 10rpx 0;
  font-size: 26rpx;
  padding: 10rpx 20rpx;
}
/* 表格横向滚动容器 */
.table-wrap {
  width: 100%;
  overflow-x: auto;
}
uni-table {
  width: 100%;
  --uni-table-font-size: 24rpx;
}
uni-table uni-td {
  padding: 10rpx 5rpx;
}
.submit-btn-wrap {
  text-align: center;
  margin-top: 30rpx;
}
.submit-btn {
  width: 100%;
  height: 80rpx;
  font-size: 28rpx;
}
/* 表格全局垂直居中 */
uni-table uni-tr,
uni-table uni-td,
uni-table uni-th {
  vertical-align: middle; /* 让所有内容（输入框、按钮）垂直居中 */
}

/* 横向滚动容器：窗口缩小时底部出现滚动条 */
.table-scroll-container {
  width: 100%; /* 容器宽度占满父元素 */
  overflow-x: auto; /* 超出部分显示横向滚动条 */
  margin-top: 10rpx;
}

/* 表格最小宽度：保证内容不挤在一起，触发滚动 */
uni-table {
  min-width: 600rpx; /* 根据内容设置最小宽度，可根据需求调整 */
}

/* 表格内容垂直居中（和操作列按钮对齐） */
uni-table uni-td,
uni-table uni-th {
  vertical-align: middle;
  padding: 15rpx 10rpx; /* 统一单元格内边距，提升整体协调感 */
}

/* 操作列按钮样式：和表格融合 */
.spec-op-btn {
  width: 90rpx; /* 固定按钮宽度，避免波动 */
  height: 50rpx; /* 匹配输入框高度 */
  line-height: 50rpx; /* 文字垂直居中 */
  font-size: 24rpx; /* 和表格其他文字大小一致 */
  padding: 0; /* 去掉多余内边距，避免文字挤压 */
}

/* 禁用状态（至少1个）的按钮样式：柔和不突兀 */
.spec-op-btn[type="default"][disabled] {
  background-color: #f5f5f5;
  border-color: #eee;
  color: #999;
}

/* 启用状态（删除）的按钮样式：醒目但不突兀 */
.spec-op-btn[type="danger"] {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  color: #ffffff;
}
:deep(.spec-form-item) {
  width: 100%;
  flex-direction: column !important;
}
</style>
