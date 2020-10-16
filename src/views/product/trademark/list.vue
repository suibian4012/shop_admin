<template>
  <div>
    <!-- 按钮 -->
    <el-button
      type="primary"
      icon="el-icon-plus"
      style="margin-bottom:20px"
      @click="ShowAddTrademark"
    >添加</el-button>

    <!-- 表格 -->
    <el-table :data="trademarks" stripe style="width: 100%" border v-loading="loading">
      <el-table-column type="index" width="80px" label="序号" align="center"></el-table-column>
      <el-table-column prop="tmName" label="品牌名称" align="center"></el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO" align="center">
        <!-- scope是一个对象，slot-scope作用域插槽，row 当前这一行对象-->
        <template slot-scope="scope">
          <img :src="scope.row.logoUrl" alt width="100" height="60" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="ShowUpdateTrademark(scope.row)"
          >修改</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页
      @size-change="handleSizeChange"-----改变当前页显示几条数据
      @current-change="getTrademarkList"----改变当前页
      :current-page="currentPage4"----默认显示第几页
      :page-sizes="[3, 6, 9]"----设置每页显示多少条数据
      :page-size="limit"----每页显示多少条数据
      layout=" prev, pager, next, jumper,->,sizes,total"----通过顺序操控布局
      :total="total"----数据总数量
    -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="getTrademarkList"
      :current-page="page"
      :page-sizes="[3, 6, 9]"
      :page-size="limit"
      layout=" prev, pager, next, jumper,->,sizes,total"
      :total="total"
      style="margin-top:20px;text-align:center"
      background
    ></el-pagination>

    <!-- 点击添加出现弹框 -->
    <el-dialog
      title="添加品牌"
      :visible="dialogFormTrademark"
      :before-close="()=>(dialogFormTrademark=false)"
    >
      <el-form :model="form" :rules="rules" ref="ruleForm">
        <el-form-item label="品牌名称" :label-width="formLabelWidth" prop="tmName">
          <el-input v-model="form.tmName" autocomplete="off" placeholder="请输入品牌的名字"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="formLabelWidth" prop="logoUrl">
          <!-- action--上传地址 -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormTrademark = false">取 消</el-button>
        <!-- <el-button type="primary" @click="dialogFormTrademark = false">确 定</el-button> -->
        <el-button type="primary" @click="addorUpdateTrademark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { trademark } from '../../../api'
import { f1 } from '../../../test/es-module/test1'
export default {
  name: 'TrademarkList',
  data() {
    return {
      page: 1,
      limit: 3,
      total: 0, //总条数
      trademarks: [], //存储获取到的品牌信息数据
      dialogFormTrademark: false, //默认弹框不显示，点击才显示
      form: {
        tmName: '',
        logoUrl: ''
      },
      formLabelWidth: '100px',
      //校验规则
      rules: {
        tmName: [
          { required: true, message: '请输入活动名称' },
          {
            min: 3,
            max: 5,
            message: '长度在 3 到 10 个字符',
            trigger: 'change'
          }
        ],
        logoUrl: [
          { required: true, message: '请上传品牌logo', trigger: 'change' }
        ]
      },
      loading: false //默认加载不显示
    }
  },
  methods: {
    // 根据页码和每页的条数来获取品牌的信息数据
    async getTrademarkList(page = 1) {
      this.page = page
      //没有数据前，显示加载中
      this.loading = true
      const result = await this.$API.trademark.getTrademarkList(
        this.page,
        this.limit
      )
      //有数据后，加载中消失
      this.loading = false
      if (result.code === 200) {
        //如果成功，更新数据
        const { records, total } = result.data
        this.total = total
        this.trademarks = records
      } else {
        this.$message.error('获取品牌列表信息失败')
      }
    },
    //分页回调----改变每页显示多少条
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`)
      this.limit = val
      this.getTrademarkList()
    },

    //分页回调----改变当前页
    // handleCurrentChange(val) {
    //   console.log(`当前页: ${val}`)
    //   this.page = val
    //   this.getTrademarkList()
    // }
    // 上传图片成功了的回调函数
    handleAvatarSuccess(res, file) {
      //res.data是请求回来的图片地址
      // this.imageUrl = URL.createObjectURL(file.raw)
      this.form.logoUrl = res.data
      //品牌logo上传成功后，清除校验信息
      //移除表单项的校验结果。传入待移除的表单项的 prop 属性或者 prop 组成的数组，如不传则移除整个表单的校验结果
      this.$refs.ruleForm.clearValidate('logoUrl')
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
    //添加或修改品牌数据（根据form中是否有id）
    addorUpdateTrademark() {
      //当点击确认时，有的表单验证没有通过，只有全部通过了才进行相关操作
      this.$refs.ruleForm.validate(async valid => {
        //表单验证，全部通过才进行操作
        if (valid) {
          // alert('submit!');
          //根据form中是否有id来判断是添加还是修改操作
          //获取form
          const { form } = this
          //用来保存调用添加或修改接口的结果
          let result
          if (form.id) {
            //如果id存在，则是修改操作，调用更新接口
            result = await this.$API.trademark.updateTrademark(form)
          } else {
            //调用添加接口
            result = await this.$API.trademark.addTrademark(form)
          }
          // const result = await this.$API.trademark.addTrademark(this.form)
          if (result.code === 200) {
            //提示信息
            // this.$message.success('添加品牌信息成功')
            this.$message.success(`${form.id ? '修改' : '添加'}信息成功`)
            //关闭窗口
            this.dialogFormTrademark = false
            //更新数据，如果是修改操作，应该重新获取当前页得数据
            this.getTrademarkList(form.id ? this.page : 1)
          } else {
            this.$message.error(`${form.id ? '修改' : '添加'}信息失败`)
          }
        }
      })
    },
    //点击添加，弹出弹框，同时清空form
    ShowAddTrademark() {
      // 指定空数据的对象, 避免显示前面指定的数据
      this.form = {
        logoUrl: '',
        tmName: ''
      }
      //弹出弹框
      this.dialogFormTrademark = true
      //点击添加按钮，清除所有校验信息
      //此时界面还没有更新, Dialog组件对象还没有产生 ==> Form组件对象也没有 ==> 直接清除会报错
      //　Vue.nectTick() 是在下次DOM更新循环结束之后执行延迟回调，在修改数据之后使用$nextTick，则可以在回调中获取更新后的DOM（dom的改变是发生在nextTick()之后），这个方法作用是当数据被修改后使用这个方法，会回调获取更新后的dom再render出来
      this.$nextTick(() => {
        this.$refs.ruleForm.clearValidate()
      })
    },
    //点击修改出现弹框
    ShowUpdateTrademark(trademark) {
      //显示弹框
      this.dialogFormTrademark = true
      //把该品牌信息对象给form
      this.form = { ...trademark }
    },
    //删除品牌数据
    deleteTrademark(trademark) {
      //点击删除，出现弹框
      this.$confirm(`此操作将永久删除${trademark.tmName}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          //如果点击了确认按钮，调用删除接口
          const result = await this.$API.trademark.deleteTrademarkById(
            trademark.id
          )
          if (result.code === 200) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            //调用接口成功，重新获取数据，如果该页数据只有一条，删除后显示上一页的数据，否则显示该页数据
            this.getTrademarkList(
              this.trademarks.length === 1 ? this.page - 1 : this.page
            )
          } else {
            this.$message({
              type: 'error',
              message: '删除失败!'
            })
          }
        })
        .catch(() => {
          //如果点击的是取消按钮
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  },
  mounted() {
    this.getTrademarkList()
  }
}
</script>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>