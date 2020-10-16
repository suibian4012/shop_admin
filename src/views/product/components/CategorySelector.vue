<template>
  <el-form inline :model="form">
    <el-form-item label="一级分类">
      <!-- el-select下拉框中的v-model保存的是el-option里的value值 -->
      <el-select
        v-model="form.category1Id"
        placeholder="请选择"
        @change="changeCategory1"
        :disabled="isDisabled"
      >
        <el-option :label="c1.name" :value="c1.id" v-for="(c1) in category1List" :key="c1.id"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="二级分类">
      <!-- el-select下拉框中的v-model保存的是el-option里的value值 -->
      <el-select
        v-model="form.category2Id"
        placeholder="请选择"
        @change="changeCategory2"
        :disabled="isDisabled"
      >
        <el-option :label="c2.name" :value="c2.id" v-for="(c2) in category2List" :key="c2.id"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="三级分类">
      <!-- el-select下拉框中的v-model保存的是el-option里的value值 -->
      <el-select
        v-model="form.category3Id"
        placeholder="请选择"
        @change="changeCategory3"
        :disabled="isDisabled"
      >
        <el-option :label="c3.name" :value="c3.id" v-for="(c3) in category3List" :key="c3.id"></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: 'CategorySelector',
  data() {
    return {
      form: {
        category1Id: '', //一级分类id
        category2Id: '', //二级分类id
        category3Id: '' //三级分类id
      },
      category1List: [], //一级分类信息数据
      category2List: [], //二级分类信息数据
      category3List: [], //三级分类信息数据
      isDisabled: false //默认下拉框启用
    }
  },
  methods: {
    //获取一级分类信息列表
    async getCategory1List() {
      const result = await this.$API.category.getCategorys1()
      if (result.code === 200) {
        this.category1List = result.data
      }
    },
    //一级选择项发生改变后调用接口获取二级分类信息--参数category1Id为选中的一级分类项的id
    async changeCategory1(category1Id) {
      // 当更改一级选中分类项时，将二级分类和三级分类的id和list重置为空
      this.form.category2Id = null
      this.form.category3Id = null
      this.category2List = []
      this.category3List = []
      //分发事件，向父级传递一级id和level
      this.$emit('changeCategory', { categoryId: category1Id, level: 1 })
      const result = await this.$API.category.getCategorys2(category1Id)
      if (result.code === 200) {
        this.category2List = result.data
      }
    },
    //二级选择项发生改变后调用接口获取三级分类信息--参数category2Id为选中的二级分类项的id
    async changeCategory2(category2Id) {
      // 当更改二级选中分类项时，将三级分类的id和list重置为空
      this.form.category3Id = null
      this.category3List = []
      //分发事件，向父级传递二级id和level
      this.$emit('changeCategory', { categoryId: category2Id, level: 2 })
      const result = await this.$API.category.getCategorys3(category2Id)
      if (result.code === 200) {
        this.category3List = result.data
      }
    },
    changeCategory3(category3Id) {
      //分发事件，向父级传递三级id和level
      this.$emit('changeCategory', { categoryId: category3Id, level: 3 })
    }
  },
  mounted() {
    this.getCategory1List()
  }
}
</script>
<style>
</style>