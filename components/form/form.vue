<template>
  <view class="form-item">
    <view class="input-label">{{ label }}</view>
    <input 
      :type="type" 
      v-model="currentValue" 
      :placeholder="placeholder" 
      class="input-field"
      :style="inputStyle"
    />
  </view>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    modelValue: {
      type: String,
      default: ''
    },
    inputStyle: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    currentValue: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    }
  }
}
</script>

<style>
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.input-label {
  width: 160rpx;
  font-size: 32rpx;
  color: #666;
}

.input-field {
  flex: 1;
  height: 100rpx;
  font-size: 32rpx;
  border: 1px solid #eee;
  border-radius: 10rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
}
</style>