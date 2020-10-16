<template>
  <div>
    <el-card style="margin-bottom:20px">
      <CategorySelector @changeCategory="changeCategory" ref="cs"></CategorySelector>
    </el-card>

    <el-card>
      <div v-show="!isShowSpuForm&&!isShowSkuForm">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addSpuForm"
          :disabled="!category3Id"
        >添加SPU</el-button>
        <el-table :data="spuInfoList" style="width: 100%;margin-top:20px" border>
          <el-table-column type="index" width="80px" label="序号"></el-table-column>
          <el-table-column prop="spuName" label="SPU名称"></el-table-column>
          <el-table-column prop="description" label="SPU描述"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row}">
              <HintButton
                type="primary"
                icon="el-icon-plus"
                title="添加SKU"
                size="mini"
                @click="showAddSku(row)"
              ></HintButton>
              <HintButton
                title="修改SPU"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showUpdateSpuForm(row.id)"
              />
              <HintButton
                title="查看SKU"
                type="info"
                icon="el-icon-info"
                size="mini"
                @click="showSkuList(row.id)"
              />

              <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="deleteSpu(row.id)">
                <HintButton
                  title="删除"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  slot="reference"
                />
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          @size-change="handleSizeChange"
          @current-change="getSpuInfoList"
          :current-page="page"
          :page-sizes="[3, 6, 9]"
          :page-size="limit"
          layout=" prev, pager, next, jumper,->,sizes,total"
          :total="total"
          style="margin-top:20px;text-align:center"
          background
        ></el-pagination>
      </div>
      <!-- 子要用父的数据并且需要修改，使用.sync -->
      <SpuForm :visible.sync="isShowSpuForm" ref="spuForm" @saveSuccess="saveSuccess"></SpuForm>
      <SkuForm
        v-show="isShowSkuForm"
        @cancel="cancel"
        ref="skuForm"
        @saveSuccess="isShowSkuForm = false"
      ></SkuForm>
    </el-card>

    <el-dialog title="SKU列表" :visible.sync="dialogTableVisible">
      <el-table :data="skuInfoList">
        <el-table-column property="skuName" label="名字" width="150"></el-table-column>
        <el-table-column property="price" label="价格(元)" width="200"></el-table-column>
        <el-table-column property="weight" label="重量(千克)"></el-table-column>
        <el-table-column property="skuDefaultImg" label="默认图片">
          <template slot-scope="{ row }">
            <img :src="row.skuDefaultImg" alt width="100" height="100" />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import SpuForm from '../components/SpuForm'
import SkuForm from '../components/SkuForm'
export default {
  name: 'SpuList',
  components: {
    SpuForm,
    SkuForm
  },
  data() {
    return {
      page: 1,
      limit: 3,
      total: 0,
      spuInfoList: [],
      category1Id: '', //一级分类id
      category2Id: '', //二级分类id
      category3Id: '', //三级分类id
      isShowSpuForm: false, //默认不显示添加或修改spufrom
      spuId: null, // 要更新的spu
      isShowSkuForm: false,
      dialogTableVisible: false,
      skuInfoList: []
    }
  },
  watch: {
    isShowSpuForm(val) {
      this.$refs.cs.isDisabled = val
    }
  },
  methods: {
    //分页回调----改变每页显示多少条
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`)
      this.limit = val
      this.getSpuInfoList()
    },
    // 分页回调----改变当前页
    // handleCurrentChange(val) {
    //   console.log(`当前页: ${val}`)
    //   this.page = val
    //   this.getTrademarkList()
    // },
    //选中分类项后，根据level分别保存一级/二级/三级id，且level等于3时才调用接口获取数据
    changeCategory({ categoryId, level }) {
      // console.log(categoryId, level)
      if (level === 3) {
        //保存三级id
        this.category3Id = categoryId
        //调用接口
        this.getSpuInfoList()
      } else if (level === 1) {
        //重置数据
        this.category2Id = null
        this.category3Id = null
        this.attrList = []
        //保存一级id
        this.category1Id = categoryId
      } else if (level === 2) {
        //重置数据
        this.category3Id = null
        this.spuInfoList = []
        //保存二级id
        this.category2Id = categoryId
      }
    },
    async getSpuInfoList(page = 1) {
      this.page = page
      const { limit, category3Id } = this
      const result = await this.$API.spu.getSpuInfoList(
        page,
        limit,
        category3Id
      )
      if (result.code === 200) {
        const { records, total } = result.data
        this.total = total
        this.spuInfoList = records
      }
    },
    showUpdateSpuForm(spuId) {
      this.$refs.spuForm.initUpdateData(spuId)
      this.isShowSpuForm = true
    },
    //保存重新获取数据
    saveSuccess() {
      this.getSpuInfoList(this.page)
    },
    //添加spu
    addSpuForm() {
      const category3Id = this.category3Id
      this.$refs.spuForm.initAddData(category3Id)
      this.isShowSpuForm = true
    },
    //查看sku
    showAddSku(spuInfo) {
      this.isShowSkuForm = true
      spuInfo = {
        ...spuInfo,
        category1Id: this.category1Id,
        category2Id: this.category2Id
      }
      this.$refs.skuForm.initAddData(spuInfo)
    },
    //从skuForm回到显示界面
    cancel() {
      this.isShowSkuForm = false
    },
    //保存（修改spu）和（添加sku）的数据回调----区别在于，修改spu有id，添加sku没有id
    saveSuccess() {
      if (this.spuId) {
        // 修改spu
        // 重新获取数据
        this.getSpuInfoList(this.page)
        this.spuId = ''
      } else {
        // 添加sku
        this.getSpuInfoList()
      }
    },
    // 点击查看SKU按钮,显示sku列表数据
    async showSkuList(spuId) {
      //显示对话框
      this.dialogTableVisible = true
      const result = await this.$API.sku.getSkuInfoListBySpuId(spuId)
      this.skuInfoList = result.data
    },
    //删除spu
    async deleteSpu(spuId) {
      const result = await this.$API.spu.deleteSpuById(spuId)
      if (result.code === 200) {
        this.$message.success('删除SPU成功')
        this.getSpuInfoList()
      } else {
        this.$message.error('删除SPU失败')
      }
    }
  }
}
</script>
<style>
</style>