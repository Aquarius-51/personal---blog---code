<template>
  <div class="dept-manger">
    <el-form :inline="true" ref="deptRuleFormRef" :model="deptRuleForm" label-width="120px"
      class="demo-userRuleForm mt-5 mb-8" :size="formSize" status-icon>
      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model.trim="deptRuleForm.deptName" placeholder="请输入部门名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="deptSubmitForm(deptRuleFormRef)">
          查询
        </el-button>
        <el-button @click="resetForm(deptRuleFormRef)">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="control-button mt-10 mb-12">
      <el-button type="primary" @click="handleCreate">创建部门</el-button>
    </div>
    <div class="dept-table">
      <el-table :data="tableData" style="width: 100%" row-key="_id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
        <el-table-column :label="item.label" :width="item.width" :prop="item.property" v-for="(item, t) in columns"
          :key="t" />
        <el-table-column align="center" label="操作" width="240px">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleAdd(scope.row)">新增</el-button>
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog v-model="dialogVisible" @close="closeDialog" :title="dynameicsTitle" width="50%" draggable>
        <div>
          <el-form ref="DialogRuleFormRef" :model="DialogRuleForm"  label-width="120px"
            class="demo-ruleForm" :size="formSize" status-icon>
            <el-form-item label="选择部门" prop="deptId">
              <el-cascader :options="options2" :props="props1" clearable v-model="DialogRuleForm.deptId" :disabled="active=='edit'"/>
              <span>不选择则为一级部门</span>
            </el-form-item>
            <el-form-item label="公司/部门名称" prop="deptName">
              <el-input v-model="DialogRuleForm.deptName" placeholder="请输入您的部门名称" />
            </el-form-item>
            <el-form-item label="主管名称" prop="userName">
              <el-select v-model="DialogRuleForm.userName" clearable placeholder="请输入用户名称" @change="handleChange">
                <el-option v-for="item in options" :key="item._id" :label="item.userName" :value="`${item.userId}/${item.userName}/${item.userEmail}`" />
              </el-select>
            </el-form-item>
            <el-form-item label="主管邮箱" prop="userEmail">
              <el-input v-model="DialogRuleForm.userEmail" placeholder="请输入您的邮箱" :disabled="true" />
            </el-form-item>
            <el-form-item label="员工名称" prop="userName2">
              <el-select v-model="DialogRuleForm.userName2" clearable placeholder="请输入用户名称" @change="handleChange2">
                <el-option v-for="item in options" :key="item._id" :label="item.userName" :value="`${item.userId}/${item.userName}/${item.userEmail}`" />
              </el-select>
            </el-form-item>
            <el-form-item label="员工邮箱" prop="userEmail2">
              <el-input v-model="DialogRuleForm.userEmail2" placeholder="请输入您的邮箱" :disabled="true" />
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="deptOperateForm(DialogRuleFormRef)">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, nextTick, computed } from 'vue'
import Api from './../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
//顶部form
const formSize = ref('default')
const deptRuleFormRef = ref<FormInstance>()
const deptRuleForm = reactive<userRuleForm>({
  deptName: '',
})
//查询
const deptSubmitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      getdeptlist()
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
//dept操作按钮
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
  DialogRuleForm.value.deptId = row._id
  dialogVisible.value = true
}
//编辑
const handleEdit = (row: any) => {
  console.log(row)
  active.value = 'edit'
  nextTick(() => {
    Object.assign(DialogRuleForm.value, row)
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
      Api.getDeptDeleteList({ _id: row._id }).then(res => {
        if (res) {
          ElMessage({
            type: 'success',
            message: '删除成功',
          })
          getdeptlist()
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
//table中columns
const columns = [
  {
    label: '公司/部门名称',
    property: 'deptName',
  },
  {
    label: '主管姓名',
    property: 'userName',
  },
  {
    label: '主管邮箱',
    property: 'userEmail',
  },
  {
    label: '员工姓名',
    property: 'userName2',
  },
  {
    label: '员工邮箱',
    property: 'userEmail2',
  },
  {
    label: '更新时间',
    property: 'updateTime',
    width: '220px'
  },
  {
    label: '注册时间',
    property: 'createTime',
    width: '220px'
  }
]
//对话框
const dialogVisible = ref(false)
const active = ref('create')
const DialogRuleFormRef = ref<FormInstance>()
const DialogRuleForm = ref<DialogdeptRuleForm>({
  deptId: [null],
  deptName: '',
  userName: '',
  userName2: '',
  userEmail: '',
  userEmail2: ''
})
//用户选择
const options = ref<interUserName[]>([])
//关闭对话框
const closeDialog = () => {
  setTimeout(() => {
    resetForm(DialogRuleFormRef.value)
  }, 200);
  
}
//表单验证
// const rules = reactive<FormRules<DialogdeptRuleForm>>({
//   deptName: [
//     { required: true, message: '请输入用户名称', trigger: 'blur' },
//     { min: 2, max: 10, message: '用户名称长度为2-10之间', trigger: 'blur' },
//   ]
// })
//动态计算对话框标题
const dynameicsTitle = computed(() => {
  if (active.value == 'create') {
    return '创建'
  } else {
    return '编辑'
  }
})
//选择用户并拿到对应邮箱
const handleChange = (val:string)=>{
  const [userId,userName,userEmail] = val.split('/')
  Object.assign(DialogRuleForm.value,{userId,userName,userEmail})
}
const handleChange2 = (val:string)=>{
  const [userId,userName2,userEmail2] = val.split('/')
  Object.assign(DialogRuleForm.value,{userId,userName2,userEmail2})
}
//对话框部门
const props1 = {
  checkStrictly: true,
  label: 'deptName',
  value: '_id'
}
const options2 = ref([])
//创建或编辑确定
const deptOperateForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      let params: any = DialogRuleForm.value;
      params.active = active.value;
      console.log(params);
      Api.getDeptOperateList(params).then(res => {
        console.log('resdept',res);
        if (res) {
          dialogVisible.value = false
          ElMessage({
            type: 'success',
            message: '设置成功',
          })
          getdeptlist()
        }
      })


    } else {
      console.log('error submit!', fields)
    }
  })
}
//请求
const getuserlist = () => {
  let params:InterParams = {}
  params.type = 'dept'
  params.state = 1
  Api.getUserList(params).then((res: any) => {
    console.log('ressssss',res);
    options.value = res
  })
}
const getdeptlist = () => {
  Api.getDeptList(deptRuleForm).then((res: any) => {
    console.log(res);
    options2.value = res
    tableData.value = res
  })
}
onMounted(() => {
  getdeptlist()
  getuserlist()
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