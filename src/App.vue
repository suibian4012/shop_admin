<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
  // async mounted () {
  //   const result = await this.$API.trademark.getTrademarkList(1,3)
  //   console.log(result)
  // }
  // async mounted() {
  //   const re = await this.$API.spu.getSpuInfoList(1, 3, 511)
  //   const res = await this.$API.sku.getSkuInfoList(1, 3)
  //   console.log(res)
  // }
}
</script>
