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
          <uni-table border stripe :min-width="800">
            <!-- 调整最小宽度，适配新增列 -->
            <!-- 设置表格最小宽度，触发滚动 -->
            <uni-tr>
              <uni-th style="width: 180rpx">规格值</uni-th>
              <!-- 新增：规格图片表头，固定宽度 -->
              <uni-th style="width: 200rpx">规格图片</uni-th>
              <uni-th style="width: 120rpx">原价</uni-th>
              <uni-th style="width: 120rpx">特价</uni-th>
              <uni-th style="width: 120rpx">操作</uni-th>
              <!-- 固定操作列宽度 -->
            </uni-tr>
            <uni-tr v-for="(row, index) in goodsForm.specList" :key="index">
              <!-- 规格值输入框 -->
              <uni-td>
                <uni-easyinput
                  v-model="row.attributeValue"
                  placeholder="如：香辣、128G"
                  @blur="() => validateSpecRow(row)"
                />
              </uni-td>
              <!-- 规格图片上传组件 -->
              <uni-td class="spec-img-cell">
                <uni-file-picker
                  file-mediatype="image"
                  mode="grid"
                  :limit="1"
                  :auto-upload="false"
                  @select="(e) => handleSpecImageSelect(e, index)"
                  @delete="() => handleSpecImageDelete(index)"
                  style="
                    width: 160rpx;
                    height: 160rpx;
                    display: block;
                    pointer-events: auto !important;
                  "
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
          完成修改
        </uni-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
const app = getApp({ allowDefault: true });
export default {
  data() {
    return {
      goodsForm: {
        gname: "",
        icon: "",
        attributeName1: "",
        specList: [
          {
            attributeValue: "",
            gdpic: "",
            originalPrice: "",
            specialPrice: "",
          },
        ],
      },
    };
  },
  onLoad(options) {
    // console.log(options.gid);
    console.log();
    if (options.gid) {
      this.getGoodsDataByGid(options.gid);
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
    // 规格图片选择事件
    handleSpecImageSelect(e: any, index: number) {
      if (!e || !e.tempFiles || e.tempFiles.length === 0) {
        uni.showToast({ title: "未选择图片", icon: "none" });
        return;
      }
      const file = e.tempFiles[0];
      this.goodsForm.specList[index].gdpic = file.tempFilePath || file.url;
    },
    // 规格图片删除事件
    handleSpecImageDelete(index: number) {
      this.goodsForm.specList[index].gdpic = "";
      // 主动清空组件的选中状态
      const pickerEls = uni
        .createSelectorQuery()
        .selectAll(`.spec-img-cell uni-file-picker`);
      pickerEls
        .fields({ node: true, size: true }, (res) => {
          if (res[index] && res[index].node) {
            (res[index].node as any).clearFiles();
          }
        })
        .exec();
    },
    addSpecRow() {
      this.goodsForm.specList.push({
        attributeValue: "",
        gdpic: "",
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
      if (!row.attributeValue) {
        uni.showToast({ title: "请填写规格值", icon: "none" });
        return false;
      }
      if (!row.gdpic) {
        uni.showToast({ title: "请上传规格图片", icon: "none" });
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
    // 获取商品数据
    getGoodsDataByGid(gid: string) {
      uni.showToast({ title: "加载中...", icon: "loading", duration: 0 });

      // 调用后端API获取商品数据
      uni.request({
        url: app.globalData.baseUrl + "goods/getcurgoodsinfo/" + gid,
        success: (res: any) => {
          uni.hideToast();

          if (res.data.statusCode == 200) {
            const goodsData = res.data.mydata;

            // 绑定商品基本数据
            this.goodsForm.gname = goodsData.gname || "";
            // 商品主图使用第一张图片，并去除反引号
            this.goodsForm.icon = goodsData.icon
              ? goodsData.icon.split(";")[0].replace(/`/g, "").trim()
              : "";
            // 规格描述使用goodsDetailList中第一个元素的attributeName1
            this.goodsForm.attributeName1 =
              goodsData.goodsDetailList && goodsData.goodsDetailList.length > 0
                ? goodsData.goodsDetailList[0].attributeName1 || ""
                : "";

            // 绑定规格数据
            if (
              goodsData.goodsDetailList &&
              goodsData.goodsDetailList.length > 0
            ) {
              this.goodsForm.specList = goodsData.goodsDetailList.map(
                (item: any) => ({
                  attributeValue: item.attributeValue1 || "",
                  gdpic: item.gdpic ? item.gdpic.replace(/`/g, "").trim() : "",
                  originalPrice: item.originalPrice
                    ? item.originalPrice.toString()
                    : "",
                  specialPrice: item.specialPrice
                    ? item.specialPrice.toString()
                    : "",
                })
              );
            } else {
              this.goodsForm.specList = [
                {
                  attributeValue: "",
                  gdpic: "",
                  originalPrice: "",
                  specialPrice: "",
                },
              ];
            }
          } else {
            uni.showToast({ title: "获取商品数据失败", icon: "none" });
          }
        },
        fail: (err) => {
          uni.hideToast();
          uni.showToast({ title: "网络错误，获取数据失败", icon: "none" });
          console.error("获取商品数据失败：", err);
        },
      });
    },
    // 提交修改
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

      // 收集所有需要上传的图片（主图 + 所有规格图）
      const filesToUpload = [
        // 主图：name 与后端约定（如 mainPic），path 是主图 blob 路径
        { type: "main", name: "mainPic", path: this.goodsForm.icon },
        // 规格图：循环收集每个规格的 gdpic，name 按索引区分（如 specPic0、specPic1）
        ...this.goodsForm.specList.map((row, index) => ({
          type: "spec",
          index,
          name: `specPic${index}`,
          path: row.gdpic,
        })),
      ];

      // 批量上传所有图片，获取服务器返回的真实 URL
      this.uploadAllImages(filesToUpload)
        .then((imageUrls) => {
          // 图片上传成功后，整理最终表单数据（用真实 URL 替换 blob 路径）
          const finalFormData = {
            gname: this.goodsForm.gname,
            attributeName1: this.goodsForm.attributeName1,
            // 主图真实 URL
            mainPicUrl: imageUrls.main,
            // 规格列表：替换 gdpic 为真实 URL，价格转数字
            specList: JSON.stringify(
              this.goodsForm.specList.map((row, index) => ({
                attributeValue: row.attributeValue,
                gdpic: imageUrls.specs[index],
                originalPrice: Number(row.originalPrice),
                specialPrice: Number(row.specialPrice),
              }))
            ),
          };

          // 提交最终表单数据（此时所有图片都是服务器可访问的 URL）
          this.submitFinalForm(finalFormData);
        })
        .catch((err) => {
          uni.hideToast();
          uni.showToast({ title: `图片上传失败：${err}`, icon: "none" });
          console.error("图片上传失败：", err);
        });
    },

    // 辅助方法：批量上传所有图片
    uploadAllImages(files: any[]): Promise<{ main: string; specs: string[] }> {
      return new Promise((resolve, reject) => {
        const total = files.length;
        let uploadedCount = 0;
        const result: { main: string; specs: string[] } = {
          main: "",
          specs: [],
        };

        // 循环上传每个文件
        files.forEach((file) => {
          uni.uploadFile({
            // 后端图片上传接口
            url: "https://你的服务器域名/api/upload/image",
            filePath: file.path,
            name: file.name,
            formData: { type: file.type },
            success: (res) => {
              uploadedCount++;
              const resData = JSON.parse(res.data);
              if (resData.code !== 0) {
                reject(`图片${file.name}上传失败`);
                return;
              }

              // 按类型存储 URL
              if (file.type === "main") {
                result.main = resData.data.url;
              } else if (file.type === "spec") {
                result.specs[file.index] = resData.data.url;
              }

              // 所有图片上传完成，resolve 结果
              if (uploadedCount === total) {
                resolve(result);
              }
            },
            fail: (err) => {
              reject(`图片${file.name}上传失败：${err.errMsg}`);
            },
          });
        });
      });
    },

    // 辅助方法：提交最终表单数据
    submitFinalForm(formData: any) {
      uni.showToast({ title: "提交商品中...", icon: "loading", duration: 0 });

      // 调用后端修改商品的API
      uni.request({
        url: "https://你的服务器域名/api/goods/update",
        method: "POST",
        data: formData,
        header: {
          "Content-Type": "application/json",
        },
        success: (res: any) => {
          uni.hideToast();
          if (res.data && res.data.code === 0) {
            uni.showToast({ title: "商品修改成功", icon: "success" });
            // 可以选择返回上一页或跳转到其他页面
            uni.navigateBack();
          } else {
            uni.showToast({ title: res.data.msg || "提交失败", icon: "none" });
          }
        },
        fail: (err) => {
          uni.hideToast();
          uni.showToast({ title: "网络错误，提交失败", icon: "none" });
          console.error("表单提交失败：", err);
        },
      });
    },
    resetForm() {
      this.goodsForm.gname = "";
      this.goodsForm.icon = "";
      this.goodsForm.attributeName1 = "";
      this.goodsForm.specList = [
        { attributeValue: "", gdpic: "", originalPrice: "", specialPrice: "" },
      ];
      if (this.$refs.filePickerRef) {
        (this.$refs.filePickerRef as any).clearFiles();
      }
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

/* 规格图片单元格样式：确保填充整个小方格 */
.spec-img-cell {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 修改规格图片上传组件内部样式，确保图片填充整个空间 */
.spec-img-cell :deep(.uni-file-picker__files) {
  width: 100%;
  height: 100%;
}

.spec-img-cell :deep(.uni-file-picker__file) {
  width: 100%;
  height: 100%;
}

.spec-img-cell :deep(.uni-file-picker__img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
:deep(.spec-form-item) {
  width: 100%;
  flex-direction: column !important;
}
</style>
