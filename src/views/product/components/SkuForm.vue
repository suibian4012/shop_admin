<template>
  <div>
    <el-form label-width="120px">
      <!-- SPU 名称 -->
      <el-form-item label="SPU 名称">
        <span>{{spuInfo.spuName}}</span>
      </el-form-item>
      <!-- SKU 名称 -->
      <el-form-item label="SKU 名称">
        <el-input placeholder="请输入SKU名称" type="text" v-model="skuInfo.skuName"></el-input>
      </el-form-item>
      <!-- 价格 -->
      <el-form-item label="价格">
        <el-input type="number" placeholder="请输入sku价格" v-model="skuInfo.price"></el-input>
      </el-form-item>
      <!-- 商品重量 -->
      <el-form-item label="商品重量（千克)">
        <el-input type="number" placeholder="商品重量" v-model="skuInfo.weight"></el-input>
      </el-form-item>
      <!-- 规格描述 -->
      <el-form-item label="规格描述">
        <el-input type="textarea" placeholder="规格描述" rows="4" v-model="skuInfo.skuDesc"></el-input>
      </el-form-item>
      <!-- 平台属性 -->

      <el-form-item label="平台属性">
        <el-form label-width="80px" inline>
          <el-form-item
            :label="attr.attrName"
            style="margin-bottom: 5px"
            v-for="(attr) in attrList"
            :key="attr.id"
          >
            <el-select v-model="attr.attrIdValueId" placeholder="请选择">
              <el-option
                :value="attr.id + ':' + value.id"
                :label="value.valueName"
                v-for="(value) in attr.attrValueList"
                :key="value.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <!-- 销售属性 -->
      <!-- <el-form-item label="销售属性">
        <el-form inline label-width="80px">
          <el-form-item label="选择颜色" v-for="(attr) in saleAttrList" :key="attr.id">
            <el-select placeholder="请选择" v-model="attr.valueId">
              <el-option
                :value="value.id"
                :label="value.saleAttrValueName"
                v-for="(value) in attr.spuSaleAttrValueList"
                :key="value.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>-->
      <el-form-item label="销售属性">
        <el-form label-width="80px" inline>
          <el-form-item
            :label="attr.saleAttrName"
            style="margin-bottom: 5px"
            v-for="(attr) in saleAttrList"
            :key="attr.id"
          >
            <el-select v-model="attr.valueId" placeholder="请选择">
              <el-option
                :value="value.id"
                :label="value.saleAttrValueName"
                v-for="(value) in attr.spuSaleAttrValueList"
                :key="value.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="选择图片">
        <el-table border :data="imageList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="80" align="center"></el-table-column>
          <el-table-column label="图片列表">
            <template slot-scope="{row}">
              <img style="width:150px; height:150px" :src="row.imgUrl" />
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="imgName"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row}">
              <el-tag type="success" v-if="row.isDefault==='1'">默认</el-tag>
              <el-button type="primary" v-else @click="setDefault(row)">设为默认</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveSku" :disabled="!skuInfo.skuName">保存</el-button>
        <el-button @click="cancel">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'SkuForm',
  data() {
    return {
      skuInfo: {
        //当前界面出现的那一刻就可以得到了
        spuId: '',
        tmId: '', //品牌的id
        category3Id: '',

        //在表单标签中通过v-model指令收集到的
        skuName: '',
        skuDesc: '', //描述信息
        price: '',
        weight: '',

        skuAttrValueList: [], // 存储选中的平台属性
        skuImageList: [], // 选中的图片数组
        skuSaleAttrValueList: [], // 销售属性数组

        skuDefaultImg: '', // 图片的地址(默认选中)---在点击设为默认按钮的时候进行数据的收集
        isSale: 0 // 上下架
      },
      saleAttrList: [], //全部销售属性
      attrList: [], //全部平台属性
      imageList: [], //全部图片
      selectedImageList: [], //选中的图片
      spuInfo: {} //当前对象
    }
  },
  methods: {
    cancel() {
      this.$emit('cancel')
    },
    initAddData(spuInfo) {
      this.spuInfo = spuInfo
      this.skuInfo.spuId = spuInfo.id
      this.skuInfo.tmId = spuInfo.tmId
      this.skuInfo.category3Id = spuInfo.category3Id

      this.getInitData()
    },
    async getInitData() {
      const { category1Id, category2Id, category3Id, id } = this.spuInfo
      //获取所有的平台属性
      const promise1 = await this.$API.attr.getAttrList(
        category1Id,
        category2Id,
        category3Id
      )
      // 根据spuId获取对应的销售属性数据数组
      const promise2 = await this.$API.sku.getSpuSaleAttrList(id)
      // 根据spuId获取对应图片列表信息数据数组
      const promise3 = await this.$API.sku.getSpuImageList(id)

      const result = await Promise.all([promise1, promise2, promise3])
      this.attrList = result[0].data
      this.saleAttrList = result[1].data
      const imageList = result[2].data
      //给图片数组中的每一个对象添加isDefault属性，用于切换tag或button的标识
      imageList.forEach(item => {
        item.isDefault = '0'
      })
      this.imageList = imageList
      // console.log(this.attrList)
      // console.log(this.saleAttrList)
      // console.log(this.imageList)
    },
    setDefault(row) {
      //排他法切换tag和button
      this.imageList.forEach(img => {
        img.isDefault = '0'
      })
      row.isDefault = '1'
      //保存默认图片地址
      this.skuInfo.skuDefaultImg = row.imgUrl
    },
    //选中图片
    handleSelectionChange(val) {
      this.selectedImageList = val
    },
    //保存sku
    async saveSku() {
      // skuInfo,saleAttrList,attrList,imageList
      const { skuInfo, saleAttrList, attrList, selectedImageList } = this
      //从全部平台属性数组中过滤出选中的数据保存到skuInfo.skuAttrValueList中
      //通过attrIdValueId可知那些平台属性是选中的
      skuInfo.skuAttrValueList = attrList.reduce((pre, item) => {
        const attrIdValueId = item.attrIdValueId
        if (attrIdValueId) {
          const [attrId, valueId] = attrIdValueId.split(':')
          pre.push({
            attrId,
            valueId
          })
        }
        return pre
      }, [])

      //过滤 销售属性数据

      skuInfo.skuSaleAttrValueList = saleAttrList.reduce((pre, item) => {
        const valueId = item.valueId
        if (valueId) {
          pre.push({
            saleAttrValueId: valueId
          })
        }
      }, [])
      // 过滤 图片数据
      skuInfo.skuImageList = selectedImageList.map(img => ({
        imgName: img.imgName,
        imgUrl: img.imgUrl,
        isDefault: img.isDefault,
        spuImgId: img.spuId
      }))
      //调用接口
      const result = await this.$API.sku.addOrUpdateSkuInfo(skuInfo)
      if (result.code === 200) {
        //提示信息
        this.$message.success('添加SKU成功')
        //关闭界面
        // this.cancel()
        //重置数据
        this.resetData()
        this.$emit('saveSuccess')
      } else {
        this.$message.error('添加SKU失败')
      }
    },
    // 重置数据
    resetData() {
      this.skuInfo = {
        // 当前界面出现的那一刻就可以得到了
        spuId: '', // spu的id
        tmId: '', // 品牌的id
        category3Id: '', // 三级分类的id
        // 在表单标签中通过v-model指令可以收集到
        skuName: '', // 名字
        skuDesc: '', // 描述信息
        price: '', // 价格
        weight: '', // 重量

        skuAttrValueList: [], // 存储选中的平台属性
        skuImageList: [], // 选中的图片数组
        skuSaleAttrValueList: [], // 销售属性数组

        skuDefaultImg: '', // 图片的地址(默认选中)---在点击设为默认按钮的时候进行数据的收集
        isSale: 0 // 上下架
      }
      this.spuInfo = {} // spu对象数据
      this.attrList = [] // 平台属性数据数组
      this.saleAttrList = [] // 销售属性数据数组
      this.imageList = [] // 图片数据数组
      this.selectedImageList = [] // 存放选中的图片数组数据
    }
  }
}
</script>
<style>
</style>