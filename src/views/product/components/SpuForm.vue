<template>
  <el-form v-show="visible" label-width="100px">
    <!-- SPU名称 -->
    <el-form-item label="SPU名称">
      <el-input type="text" placeholder="请输入SPU名称" v-model="spuInfo.spuName"></el-input>
    </el-form-item>

    <!-- 品牌 -->
    <el-form-item label="品牌">
      <el-select v-model="spuInfo.tmId">
        <el-option :label="tm.tmName" :value="tm.id" v-for="(tm) in trademarkList" :key="tm.id"></el-option>
      </el-select>
    </el-form-item>

    <!-- SPU描述 -->
    <el-form-item label="SPU描述">
      <el-input type="textarea" rows="4" placeholder="SPU描述" v-model="spuInfo.description"></el-input>
    </el-form-item>

    <!-- SPU图片 -->
    <el-form-item label="SPU图片">
      <el-upload
        action="/dev-api/admin/product/fileUpload"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :before-upload="beforeAvatarUpload"
        :file-list="spuImageList"
        multiple
      >
        <i class="el-icon-plus"></i>
        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt />
      </el-dialog>
    </el-form-item>

    <!-- 销售属性 -->
    <el-form-item label="销售属性">
      <el-select
        v-model="attrIdAttrName"
        :placeholder="`${unSelectedSaleAttrList.length>0?`还有${unSelectedSaleAttrList.length}个可以选择`:'木有了'}`"
      >
        <el-option
          v-for="(attr) in unSelectedSaleAttrList"
          :key="attr.id"
          :value="attr.id+':'+attr.name"
          :label="attr.name"
        ></el-option>
      </el-select>
      <el-button
        type="primary"
        icon="el-icon-plus"
        :disabled="!attrIdAttrName"
        @click="addAttr"
      >添加销售属性</el-button>
    </el-form-item>

    <!-- 表格 -->
    <el-form-item>
      <el-table style="width: 100%" border :data="spuInfo.spuSaleAttrList">
        <el-table-column type="index" label="序号" width="80"></el-table-column>
        <el-table-column prop="saleAttrName" label="属性名称" width="150"></el-table-column>
        <el-table-column label="属性值名称列表">
          <template slot-scope="{row}">
            <el-tag
              v-for="(value,index) in row.spuSaleAttrValueList"
              :key="value.id"
              closable
              :disable-transitions="false"
              @close="handleClose(row.spuSaleAttrValueList,index)"
            >{{value.saleAttrValueName}}</el-tag>
            <el-input
              class="input-new-tag"
              v-if="row.edit"
              v-model="row.saleAttrValueName"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm(row)"
              @blur="handleInputConfirm(row)"
            ></el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">添加属性</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{row, $index}">
            <el-popconfirm :title="`确定删除${row.saleAttrName}?`" @onConfirm="deleteAttrValue($index)">
              <hint-button
                slot="reference"
                type="danger"
                size="mini"
                icon="el-icon-delete"
                title="删除属性"
              ></hint-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <!-- 底下两个按钮 -->
    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="back">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: 'SpuForm',
  props: ['visible'],
  data() {
    return {
      attrIdAttrName: '',
      dialogImageUrl: '',
      dialogVisible: false,
      supId: null, //spuId

      spuImageList: [], //spu图片
      trademarkList: [], //品牌
      saleAttrList: [], //销售属性
      spuInfo: {
        spuName: '', //spu名称
        description: '', //spu描述
        category3Id: '',
        tmId: '', //品牌id
        spuSaleAttrList: [], //销售属性数组
        spuImageList: [] //图片数组
      }
      // inputVisible: false,
      // inputValue: ''
    }
  },
  computed: {
    //saleAttrList:所有销售属性数据----spuSaleAttrList:当前对象的销售属性
    unSelectedSaleAttrList() {
      const {
        saleAttrList,
        spuInfo: { spuSaleAttrList }
      } = this
      return saleAttrList.filter(
        sa => !spuSaleAttrList.some(ssa => ssa.saleAttrName === sa.name)
      )
    }
  },
  methods: {
    back() {
      //子要用父的数据并且需要修改，使用.sync
      this.$emit('update:visible', false)
    },
    //上传图片回调
    //移除图片
    handleRemove(file, fileList) {
      // console.log(file, fileList)
      this.spuImageList = fileList
    },
    //预览图片
    handlePictureCardPreview(file) {
      // console.log(file.url)

      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    // 上传图片成功了的回调函数
    handleSuccess(res, file, fileList) {
      this.spuImageList = fileList
    },
    // 上传图片的限制的回调函数
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      // const isJPG=['image/jpeg','image/png'].includes(file.type)
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    initUpdateData(spuId) {
      this.spuId = spuId
      //根据spuId获取spuInfo对象信息
      this.getSpuInfo()
      //根据spuId获取当前的spuInfo对象中的所有图片信息数据对象那个数组
      this.getSPuImageList()
      //获取所有品牌信息数据数组
      this.getTrademarkList()
      //获取所有销售属性数据数组
      this.getSpuSaleAttrList()
    },
    //根据spuId获取spuInfo对象信息
    async getSpuInfo() {
      const result = await this.$API.spu.getSpuInfoById(this.spuId)
      if (result.code === 200) {
        this.spuInfo = result.data
      }
    },
    //根据spuId获取当前的spuInfo对象中的所有图片信息数据对象那个数组
    async getSPuImageList() {
      const result = await this.$API.sku.getSpuImageList(this.spuId)
      const spuImageList = result.data
      spuImageList.forEach(item => {
        item.name = item.imgName
        item.url = item.imgUrl
      })
      this.spuImageList = spuImageList
    },
    //获取所有品牌信息数据数组
    async getTrademarkList() {
      const result = await this.$API.trademark.getTrademarkList()
      if (result.code === 200) {
        this.trademarkList = result.data
      }
    },
    //获取所有销售属性数据数组
    async getSpuSaleAttrList() {
      const result = await this.$API.spu.getBaseSaleAttrList()
      if (result.code === 200) {
        this.saleAttrList = result.data
      }
      //   console.log(this.saleAttrList)
    },
    //删除属性值
    handleClose(valueList, index) {
      valueList.splice(index, 1)
    },
    //添加属性回调
    showInput(attr) {
      // 要进入到编辑模式
      // 因为attr是销售属性对象,edit这个属性是后添加的,不是响应式的属性数据,所以,直接修改true或者false,是不是让界面渲染的
      // attr.edit = true
      if (!attr.hasOwnProperty('edit')) {
        // 添加这个响应式属性
        this.$set(attr, 'edit', true)
      } else {
        attr.edit = true
      }
      this.$nextTick(_ => {
        // 获取焦点
        // this.$refs.saveTagInput.$refs.input.focus()
        this.$refs.saveTagInput.focus()
      })
    },
    //失去焦点或回车回调--进入查看模式
    handleInputConfirm(attr) {
      // attr---即row,当前spu对象
      //获取文本框输入的值
      const saleAttrValueName = attr.saleAttrValueName
      //如果输入的值不为空
      if (saleAttrValueName) {
        //判断输入的内容是否与原有数据重复
        const isRepeat = attr.spuSaleAttrValueList.some(
          value => value.saleAttrValueName === saleAttrValueName
        )
        //如果不重复，则添加进数组中，否则出现警告信息
        if (!isRepeat) {
          attr.spuSaleAttrValueList.push({
            baseSaleAttrId: attr.baseSaleAttrId,
            saleAttrValueName
          })
        } else {
          this.$message.warning('不能添加重复数据')
          return
        }
      }
      //数据添加成功后，切换为查看模式，并将输入的内容重置
      attr.edit = false
      attr.saleAttrValueName = ''
    },
    deleteAttrValue(index) {
      this.spuInfo.spuSaleAttrList.splice(index, 1)
    },
    //添加销售属性
    addAttr() {
      //从attrIdAttrName里获取attrId和attrName
      const [baseSaleAttrId, saleAttrName] = this.attrIdAttrName.split(':')
      //向数组里添加销售属性
      this.spuInfo.spuSaleAttrList.push({
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: []
      })
      //清空attrIdAttrName
      this.attrIdAttrName = ''
    },
    async save() {
      //获取spuInfo和spuImageList
      const { spuInfo, spuImageList } = this
      // console.log(spuImageList)

      //对spuInfo里的spuImageList进行修改--图片都需要imgName和imgUrl，原有的数据存在这两个属性和name，新添加的图片没有imgName和imgUrl，但有name和response
      spuInfo.spuImageList = spuImageList.map(img => ({
        imgName: img.imgName,
        imgUrl: img.response ? img.response.data : img.imgUrl
      }))
      //过滤spuInfo,删除edit和saleAttrValueName
      spuInfo.spuSaleAttrList = spuInfo.spuSaleAttrList.filter(attr => {
        //当spuSaleAttrValueList数组里有数据时，说明该对象有saleAttrValueName属性
        if (attr.spuSaleAttrValueList.length > 0) {
          delete attr.edit
          delete attr.saleAttrValueName
          return true
        }
        return false
      })

      // console.log(spuInfo.spuImageList)

      //调用接口
      const result = await this.$API.spu.saveOrUpdateSpuInfo(spuInfo)
      if (result.code === 200) {
        // 提示信息
        this.$message.success('保存SPU成功')
        //关闭界面
        this.back()
        //重置数据
        this.resetData()
        //通知父级组件保存成功
        this.$emit('saveSuccess')
      } else {
        this.$message.error('保存SPU失败')
      }
    },
    resetData() {
      this.attrIdAttrName = ''
      this.dialogImageUrl = ''
      this.dialogVisible = false
      this.supId = '' //spuId
      this.spuImageList = [] //spu图片
      this.trademarkList = [] //品牌
      this.saleAttrList = [] //销售属性
      this.spuInfo = {
        spuName: '', //spu名称
        description: '', //spu描述
        category3Id: '',
        tmId: '', //品牌id
        spuSaleAttrList: [], //销售属性数组
        spuImageList: [] //图片数组
      }
    },
    initAddData(category3Id) {
      //保存三级id
      this.spuInfo.category3Id = category3Id
      //获取所有品牌
      this.getTrademarkList()
      //获取所有销售属性
      this.getSpuSaleAttrList()
    }
  }
}
</script>
<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>