<template>
  <div class="menu-manger">
    <el-form :inline="true" ref="menuuserRuleFormRef" :model="menuRuleForm" label-width="120px"
      class="demo-userRuleForm mt-5 mb-8" :size="formSize" status-icon>
      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model.trim="menuRuleForm.menuName" placeholder="请输入菜单名称" />
      </el-form-item>
      <el-form-item label="菜单状态" prop="menuState">
        <el-select v-model="menuRuleForm.menuState" placeholder="请输入菜单状态">
          <el-option :label="item.label" :value="item.value" v-for="(item, i) in options" :key="i" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="userSubmitForm(menuuserRuleFormRef)">
          查询
        </el-button>
        <el-button @click="resetForm(menuuserRuleFormRef)">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="control-button mt-10 mb-12">
      <el-button type="primary" @click="handleCreate">创建</el-button>
      <span class="pl-3 text-sm">(二级菜单请用新增)</span>
    </div>
    <div class="user-table">
      <el-table :data="tableData" style="width: 100%" row-key="_id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
        <el-table-column :label="item.label" :width="item.width" :prop="item.property" :formatter="item.formatter"
          v-for="(item, t) in columns" :key="t" />
        <el-table-column align="center" label="操作" width="240px">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleAdd(scope.row)">新增</el-button>
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog v-model="dialogVisible" @close="closeDialog" :title="dynameicsTitle" width="50%"
        draggable>
        <div>
          <el-form ref="DialogRuleFormRef" :model="DialogRuleForm" :rules="rules" label-width="120px" class="demo-ruleForm"
            :size="formSize" status-icon>
            <el-form-item label="父级菜单" prop="parentId">
              <el-cascader :options="options2" :props="props1" clearable v-model="DialogRuleForm.parentId" />
              <span>不写则为一级菜单</span>
            </el-form-item>
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="DialogRuleForm.menuType">
                <el-radio :label="1">菜单</el-radio>
                <el-radio :label="2">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="DialogRuleForm.menuName" placeholder="请输入您的菜单名称" />
            </el-form-item>
            <el-form-item label="菜单图标" prop="icon" v-if="DialogRuleForm.menuType==1">
              <el-input v-model="DialogRuleForm.icon" placeholder="请输入您的菜单图标" />
            </el-form-item>
            <el-form-item label="路由地址" prop="path" v-if="DialogRuleForm.menuType==1">
              <el-input v-model="DialogRuleForm.path" placeholder="请输入您的路由地址" />
            </el-form-item>
            <el-form-item label="组件路径" prop="component" v-if="DialogRuleForm.menuType==1">
              <el-input v-model="DialogRuleForm.component" placeholder="请输入您的组件路径" />
            </el-form-item>
            <el-form-item label="权限标识" prop="menuCode" v-if="DialogRuleForm.menuType==2">
              <el-input v-model="DialogRuleForm.menuCode" placeholder="请输入您的权限标识" />
            </el-form-item>
            <el-form-item label="菜单状态" prop="menuState">
              <el-radio-group v-model="DialogRuleForm.menuState">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="2">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="menuOperateForm(DialogRuleFormRef)">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, nextTick,computed } from 'vue'
import Api from './../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
//顶部form
const formSize = ref('default')
const menuuserRuleFormRef = ref<FormInstance>()
const menuRuleForm = reactive<userRuleForm>({
  menuName: '',
  menuState: 1,
})
//查询
const userSubmitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      getmenulist()
    } else {
      console.log('error submit!', fields)
    }
  })
}
//重置
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
const options = [
  {
    label: '正常',
    value: 1
  },
  {
    label: '停用',
    value: 2
  }
]
//menu操作按钮
//创建
const handleCreate = () => {
  dialogVisible.value = true
  active.value = 'create'
}

//table
const tableData: any = ref([])
//新增
const handleAdd = (row: any) => {
  console.log(row)
  active.value = 'add'
  DialogRuleForm.parentId = row._id
  dialogVisible.value = true
}
//编辑
const handleEdit = (row: any) => {
  console.log(row)
  active.value = 'edit'
  nextTick(() => {
    Object.assign(DialogRuleForm, row)
  })
  dialogVisible.value = true
}
//删除
const handleDelete = (row: any) => {
  console.log(row)
  ElMessageBox.confirm(
    '您确定要删除这条数据吗?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      Api.getMenuDeleteList({_id:row._id}).then(res => {
        if (res) {
          ElMessage({
            type: 'success',
            message: '删除成功',
          })
          getmenulist()
        }
      })

    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消',
      })
    })
}
//选择框
const columns = [
  {
    label: '菜单名称',
    property: 'menuName',
    width:'180px'
  },
  {
    label: '图标',
    property: 'icon',
    width:'130px'
  },
  {
    label: '菜单类型',
    property: 'menuType',
    width:'120px',
    formatter: function (_row: any, _column: any, cellValue: string | number, _index: any) {
    let obj: interTable = {
      1: '菜单',
      2: '按钮'
    }
    return obj[cellValue]
  }
  },
  {
    label: '权限标识',
    property: 'menuCode',
    width:'120px'
  },
  {
    label: '路由地址',
    property: 'path',
    width:'120px'
  },
  {
    label: '组件路径',
    property: 'component',
    width:'120px'
  },
  {
    label: '菜单状态',
    property: 'menuState',
    width:'120px',
    formatter: function (_row: any, _column: any, cellValue: string | number, _index: any) {
    let obj: interTable = {
      1: '正常',
      2: '停用'
    }
    return obj[cellValue]
  }

  },
  {
    label: '注册时间',
    property: 'createTime',
    width:'220px'
  }
]
//对话框
const dialogVisible = ref(false)
const active = ref('add')
const DialogRuleFormRef = ref<FormInstance>()
const DialogRuleForm = reactive<DialogMenuRuleForm>({
  parentId:[null],
  menuType:1,
  icon:'',
  menuName: '',
  path: '',
  component: '',
  menuCode:'',
  menuState: 1,
})
//关闭对话框
const closeDialog = () => {
  resetForm(DialogRuleFormRef.value)
}
//表单验证
const rules = reactive<FormRules<DialogMenuRuleForm>>({
 menuName: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, max: 10, message: '菜单名称长度为2-10之间', trigger: 'blur' },
  ]
})
//动态计算对话框标题
const dynameicsTitle = computed(()=>{
  if(active.value=='create'){
    return '创建'
  }else if(active.value=='add'){
    return '新增'
  }else {
    return '编辑'
  }
})
//对话框部门
const props1 = {
  checkStrictly: true,
  label: 'menuName',
  value: '_id'
}
const options2 = ref([])
//新增或编辑确定
const menuOperateForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      let params: any = DialogRuleForm;
      params.active = active.value;
      console.log(params);
      Api.getMenuOperateList(params).then(res => {
        if (res) {
          dialogVisible.value = false
          ElMessage({
            type: 'success',
            message: '设置成功',
          })
          getmenulist()
        }
      })
      

    } else {
      console.log('error submit!', fields)
    }
  })
}
//请求
const getmenulist = () => {
  Api.getMenuList(menuRuleForm).then((res: any) => {
    console.log(res);
    tableData.value = res
    options2.value = res
  })
}
onMounted(() => {
  getmenulist()
})
</script>
<style scoped lang="scss">
.demo-pagination-block+.demo-pagination-block {
  margin-top: 10px;
}

.demo-pagination-block .demonstration {
  margin-bottom: 16px;
}
</style>