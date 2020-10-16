<template>
  <div>
    <el-card style="margin-bottom:20px">
      <!-- 下拉框公共组件 -->
      <CategorySelector @changeCategory="changeCategory" ref="cs"></CategorySelector>
    </el-card>

    <!-- 数据显示部分 -->
    <el-card>
      <div v-show="isShowUpdateAttr">
        <!-- 添加按钮:只有三级id存在才启用，否则为禁用状态 -->
        <el-button
          type="primary"
          icon="el-icon-plus"
          style="margin-bottom:20px"
          @click="addAttr"
          :disabled="!category3Id"
        >添加属性</el-button>

        <!-- 数据显示部分 -->
        <el-table :data="attrList" style="width: 100%" border>
          <el-table-column type="index" width="80px" label="序号"></el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150px"></el-table-column>
          <el-table-column prop="attrValueList" label="属性值列表">
            <!-- scope是一个对象，slot-scope作用域插槽，row 当前这一行对象-->
            <template slot-scope="{row}">
              <el-tag
                type="info"
                v-for="(item) in row.attrValueList"
                :key="item.id"
              >{{item.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150px">
            <template slot-scope="{row}">
              <HintButton
                type="primary"
                icon="el-icon-edit"
                title="修改"
                size="mini"
                @click="showUpdateAttr(row)"
              ></HintButton>
              <!-- <HintButton type="danger" icon="el-icon-delete" title="删除" size="mini"></HintButton> -->
              <el-popconfirm :title="`确定要删除${row.attrName}?`" @onConfirm="deleteAttr(row.id)">
                <HintButton
                  type="danger"
                  icon="el-icon-delete"
                  title="删除"
                  size="mini"
                  slot="reference"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 修改显示区域 -->
      <div v-show="!isShowUpdateAttr">
        <!-- 表单区域 -->
        <el-form inline :model="formAttr">
          <el-form-item label="属性名">
            <el-input v-model="formAttr.attrName" placeholder="请输入属性值"></el-input>
          </el-form-item>
        </el-form>

        <!-- 两个按钮区域 -->
        <!-- 添加属性值按钮只有当attrName不为空才启用，否则禁用 -->
        <div style="margin-bottom:20px">
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="addAttrValue"
            :disabled="!formAttr.attrName.trim()"
          >添加属性值</el-button>
          <el-button @click="isShowUpdateAttr=true">取消</el-button>
        </div>

        <!-- 表格区域 -->
        <el-table style="width: 100%;margin-bottom:20px" border :data="formAttr.attrValueList">
          <el-table-column type="index" width="150px" label="序号" align="center"></el-table-column>
          <el-table-column label="属性值名称" prop="valueName">
            <template slot-scope="{row,$index}">
              <!-- 编辑模式 -->
              <el-input
                v-model="row.valueName"
                type="text"
                size="mini"
                v-if="row.edit"
                :ref="$index"
                placeholder="请输入属性值"
                @blur="toView(row)"
                @keyup.13.native="toView(row)"
              ></el-input>
              <!-- 查看模式 -->
              <span
                v-else
                @click="toEdit(row,$index)"
                style="display: inline-block; width: 100%;"
              >{{row.valueName}}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150px" align="center">
            <template slot-scope="{row,$index}">
              <el-popconfirm :title="`确定要删除${row.valueName}?`" @onConfirm="deleteValue($index)">
                <HintButton
                  type="danger"
                  icon="el-icon-delete"
                  title="删除"
                  size="mini"
                  slot="reference"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <!-- 底下两个按钮 -->
        <!-- 只有当attrName有值，并且属性值数组即attrValueList有值按钮才被启用，否则禁用 -->
        <el-button type="primary" @click="addOrUpdateAttr" :disabled="!isSaveVaild">保存</el-button>
        <el-button @click="isShowUpdateAttr=true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>
<script>
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'AttrList',
  data() {
    return {
      category1Id: '', //一级分类id
      category2Id: '', //二级分类id
      category3Id: '', //三级分类id
      attrList: [], //平台属性数据
      isShowUpdateAttr: true, //是否是添加属性或修改属性的界面
      formAttr: {
        attrName: '',
        attrValueList: []
      } //用来保存操作的平台对象
    }
  },
  computed: {
    isSaveVaild() {
      //只有当attrName有值且属性值数组中只有有一个有值按钮才为启用状态
      return (
        this.formAttr.attrName &&
        this.formAttr.attrValueList.some(item => item.valueName.trim())
      )
    }
  },
  watch: {
    isShowUpdateAttr(val) {
      this.$refs.cs.isDisabled = !val
    }
  },
  methods: {
    //选中分类项后，根据level分别保存一级/二级/三级id，且level等于3时才调用接口获取数据
    changeCategory({ categoryId, level }) {
      // console.log(categoryId, level)
      if (level === 3) {
        //保存三级id
        this.category3Id = categoryId
        //调用接口
        this.getAttrList()
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
        this.attrList = []
        //保存二级id
        this.category2Id = categoryId
      }
    },
    //根据三个id调用接口，获取平台属性数据
    async getAttrList() {
      const result = await this.$API.attr.getAttrList(
        this.category1Id,
        this.category2Id,
        this.category3Id
      )
      if (result.code === 200) {
        this.attrList = result.data
      }
    },
    //点击添加，显示更新属性的界面，并传递数据
    showUpdateAttr(attr) {
      this.isShowUpdateAttr = false
      //深拷贝
      this.formAttr = cloneDeep(attr)
    },
    //更新属性界面的删除按钮回调
    deleteValue(index) {
      this.formAttr.attrValueList.splice(index, 1)
    },
    //添加属性值---->向formAttr.attrValueList数组中添加对象
    addAttrValue() {
      this.formAttr.attrValueList.push({
        //valueName和attrId后台数据库原本就有该属性
        valueName: '',
        attrId: this.formAttr.id,
        //edit属性后台数据库中没有，是为了判断编辑模式和查看模式加的，最后后台数据库是需要删除该属性的
        edit: true
      })
      //让数组中最后一个数据出现光标
      //使用nextTick原因：应该是数据发生改动，界面渲染出文本框，然后再获取该文本框让他有焦点,否则出现undefined.focus错误
      this.$nextTick(() => {
        // HTMLElement.focus() 方法用于设置焦点
        this.$refs[this.formAttr.attrValueList.length - 1].focus()
      })
    },
    //添加属性值时失去焦点和回车变成查看模式
    toView(row) {
      if (row.valueName) {
        row.edit = false
      }
    },
    //点击进入编辑模式
    //新添加的数据对象中的edit是响应式的，所以改变可以更新视图，而后台中原有数据没有edit属性，当原有数据.edit时，向原有数据添加了edit属性，但此时的edit就不是响应式属性了
    //vm.$set(target,property,value)向响应式对象中添加一个 property，并确保这个新 property 同样是响应式的，且触发视图更新
    //hasOwnProperty() 方法会返回一个布尔值，指示对象自身属性中是否具有指定的属性
    toEdit(row, $index) {
      //如果没有edit属性
      if (!row.hasOwnProperty('edit')) {
        this.$set(row, 'edit', true)
      } else {
        //如果有edit属性
        row.edit = true
      }
      this.$nextTick(() => {
        // HTMLElement.focus() 方法用于设置焦点
        this.$refs[$index].focus()
      })
    },
    //保存回调
    async addOrUpdateAttr() {
      //过滤edit
      this.formAttr.attrValueList = this.formAttr.attrValueList.filter(item => {
        delete item.edit
        return item.valueName.trim()
      })
      //调用接口
      const result = await this.$API.attr.saveOrUpdateAttr(this.formAttr)
      if (result.code === 200) {
        //提示信息
        this.$message.success(`更新成功`)
        //关闭窗口
        this.isShowUpdateAttr = true
        //重新获取数据
        this.getAttrList()
      } else {
        //提示信息
        this.$message.error(`更新失败`)
      }
    },
    //添加平台属性
    addAttr() {
      //添加平台属性
      this.formAttr = {
        attrName: '',
        categoryId: this.category3Id,
        categoryLevel: 3,
        attrValueList: [] //属性值数组
      }
      //切换添加(修改)界面
      this.isShowUpdateAttr = false
    },
    //删除平台属性
    async deleteAttr(id) {
      const result = await this.$API.attr.deleteAttrById(id)
      if (result.code === 200) {
        this.$message.success('删除属性成功')
        this.getAttrList()
      } else {
        this.$message.error('删除属性失败')
      }
    }
  }
}
</script>
<style scoped>
</style>