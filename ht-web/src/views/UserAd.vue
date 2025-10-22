<template>
  <div class="user-manger">
    <el-form :inline="true" ref="useruserRuleFormRef" :model="userRuleForm" label-width="120px"
      class="demo-userRuleForm mt-5 mb-8" :size="formSize" status-icon>
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model.trim="userRuleForm.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model.trim="userRuleForm.userName" placeholder="请输入用户名称" />
      </el-form-item>
      <el-form-item label="用户状态" prop="state">
        <el-select v-model="userRuleForm.state" placeholder="请输入用户状态">
          <el-option :label="item.label" :value="item.value" v-for="(item, i) in options" :key="i" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="userSubmitForm(useruserRuleFormRef)">
          查询
        </el-button>
        <el-button @click="resetForm(useruserRuleFormRef)">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="control-button mt-10 mb-12">
      <el-button type="primary" @click="handleAdd"  v-has="'user-add'">新增</el-button>
      <el-button type="danger" @click="handleAllDelate"  v-has="'user-alldelete'">批量删除</el-button>
      <el-button type="success" v-has="'user-export'" @click="handleExcel">导出数据</el-button>
    </div>
    <div class="user-table">
      <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column :label="item.label" :prop="item.property" :formatter="item.formatter"
          v-for="(item, t) in columns" :key="t" />
        <el-table-column align="center" label="操作">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)" v-has="'user-edit'">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)"  v-has="'user-delete'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="pager.currentPage" v-model:page-size="pager.pageSize" :page-sizes="[1, 3, 5,7,10]"
        :small="small" :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper"
        :total="pager.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      <el-dialog v-model="dialogVisible" @close="closeDialog" :title="active == 'add' ? '用户新增' : '用户编辑'" width="45%"
        draggable>
        <div>
          <el-form ref="DialogRuleFormRef" :model="DialogRuleForm" :rules="rules" label-width="90px" class="demo-ruleForm"
            :size="formSize" status-icon>
            <el-form-item label="用户" prop="userName">
              <el-input v-model="DialogRuleForm.userName" placeholder="请输入您的用户名" />
            </el-form-item>
            <el-form-item label="邮箱" prop="userEmail">
              <el-input v-model="DialogRuleForm.userEmail" placeholder="请输入您的邮箱" />
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="DialogRuleForm.mobile" placeholder="请输入您的手机号" />
            </el-form-item>
            <el-form-item label="岗位" prop="job">
              <el-input v-model="DialogRuleForm.job" placeholder="请输入您的岗位" />
            </el-form-item>
            <el-form-item label="状态" prop="state">
              <el-select v-model="DialogRuleForm.state" placeholder="请输入您的状态">
                <el-option :label="item.label" :value="item.value" v-for="(item, s) in dialogoptions" :key="s" />
              </el-select>
            </el-form-item>
            <el-form-item label="系统角色" prop="roleList">
              <el-select v-model="DialogRuleForm.roleList" multiple placeholder="请选择" style="width: 240px">
                <el-option v-for="(item, r) in options1" :key="r" :label="item.roleName" :value="item._id" />
              </el-select>
            </el-form-item>
            <el-form-item label="部门" prop="deptId">
              <el-cascader :options="options2" :props="props1" clearable v-model="DialogRuleForm.deptId" />
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="userOperateForm(DialogRuleFormRef)">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, nextTick } from 'vue'
import Api from './../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
//顶部form
const formSize = ref('default')
const useruserRuleFormRef = ref<FormInstance>()
const userRuleForm = reactive<userRuleForm>({
  userId: '',
  userName: '',
  state: 1,
})
//查询
const userSubmitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      getuserlist()
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
const options = [{
  label: '所有',
  value: 0
},
{
  label: '在职',
  value: 1
},
{
  label: '离职',
  value: 2
},
{
  label: '试用期',
  value: 3
}
]
//user操作按钮
//新增
const handleAdd = () => {
  dialogVisible.value = true
  active.value = 'add'
}
// 批量删除
const handleAllDelate = (e: any) => {
  console.log(e);
  ElMessageBox.confirm(
    '您确定要删除这些数据吗?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      Api.getUserDeleteList({userIds:arr.value}).then(res => {
        if (res) {
          getuserlist()
          ElMessage({
            type: 'success',
            message: '删除成功',
          })
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
//导出数据
const handleExcel = () => {
  Api.getExcel().then((res: any) => {
    console.log(res);
    const uploadExcel = (fileName:any) => {
      let length = res.data.length
      let buf = new ArrayBuffer(length)
      let view = new Uint8Array(buf)
      for (let i = 0;i<length; i++) {
         view[i] = res.data[i]
      }
      let blob:any = new Blob([buf])
      let url = URL.createObjectURL(blob)
      const aLink = document.createElement("a");
      aLink.setAttribute('downLoad',fileName)
      aLink.setAttribute('href',url)
      document.body.appendChild(aLink)
      console.log(document.body);
      aLink.click()
      document.body.removeChild(aLink)
      URL.revokeObjectURL(blob);
    }
    uploadExcel("myfile.xlsx")
  });
};
//table
const tableData: any = ref([])
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
      Api.getUserDeleteList({userIds:row.userId}).then(res => {
        if (res) {
          getuserlist()
          ElMessage({
            type: 'success',
            message: '删除成功',
          })
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
let arr = ref<any>([])
const multipleSelection = ref([])
const handleSelectionChange = (val: any) => {
  multipleSelection.value = val
  console.log(multipleSelection.value);
  arr.value =  multipleSelection.value.map((v:any)=>{
    return v.userId
  })
  console.log(arr.value);
}
const columns = [{
  label: '用户ID',
  property: 'userId',
  width: '100px'
},
{
  label: '用户名称',
  property: 'userName'
},
{
  label: '用户邮箱',
  property: 'userEmail'
},
{
  label: '用户角色',
  property: 'role',
  formatter: function (_row: any, _column: any, cellValue: string | number, _index: any) {
    let obj: interTable = {
      0: '管理员',
      1: '普通用户'
    }
    return obj[cellValue]
  }
},
{
  label: '用户状态',
  property: 'state',
  formatter: function (_row: any, _column: any, cellValue: string | number, _index: any) {
    let obj: interTable = {
      0: '所有',
      1: '在职',
      2: '离职',
      3: '试用期'
    }
    return obj[cellValue]
  }
},
{
  label: '注册时间',
  property: 'createTime'
},
{
  label: '最后登录时间',
  property: 'lastLoginTime'
}
]

//分页
const pager = reactive({
  currentPage :1,//当前页
  pageSize :10,//一页多少条数据
  total:0//总条数
})
const small = ref(false)
const background = ref(false)
const disabled = ref(false)
const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
  pager.pageSize = val
  getuserlist()
}
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
  pager.currentPage = val
  getuserlist()
}
//对话框
const dialogVisible = ref(false)
const active = ref('add')
const DialogRuleFormRef = ref<FormInstance>()
const DialogRuleForm = reactive<DialogRuleForm>({
  userName: '',
  userEmail: '',
  mobile: '',
  job: '',
  state: 1,
  roleList: '',
  deptId: ''
})
const dialogoptions = [
  {
    label: '在职',
    value: 1
  },
  {
    label: '离职',
    value: 2
  },
  {
    label: '试用期',
    value: 3
  }
]
//关闭对话框
const closeDialog = () => {
  resetForm(DialogRuleFormRef.value)
}
//自定义校验
const validateMobile = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入正确手机号'))
  } else if (/^1[3-9]\d{9}$/.test(value)) {
    callback()
  } else {
    callback(new Error("手机号格式不对"))
  }
}
//表单验证
const rules = reactive<FormRules<DialogRuleForm>>({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 10, message: '用户名长度为2-10之间', trigger: 'blur' },
  ],
  mobile: [
    {
      required: true,
      validator: validateMobile
    },
  ],
  state: [
    {
      required: true,
      message: '请输入状态',
      trigger: 'blur',
    },
  ]
})

//对话框多选系统角色
const value1 = ref([])
const options1 = ref<any>([])
//对话框部门
const props1 = {
  checkStrictly: true,
  label: 'deptName',
  value: '_id'
}
const options2 = ref([])
//新增或编辑确定
const userOperateForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      let params: any = DialogRuleForm;
      params.active = active.value;
      console.log(params);
      Api.getUserOperateList(params).then(res => {
        if (res) {
          dialogVisible.value = false
          getuserlist()
        }
      })


    } else {
      console.log('error submit!', fields)
    }
  })
}
//请求
const getuserlist = () => {
  Api.getUserList({...userRuleForm,...pager}).then((res: any) => {
    let {list,total}= res
    tableData.value = list
    pager.total = total
  })
}
const getrolelist = () => {
  Api.getRoleList().then((res: any) => {
    options1.value = res.list
  })
}

const getdeptlist = () => {
  Api.getDeptList().then((res: any) => {
    options2.value = res
  })
}
onMounted(() => {
  getuserlist()
  getrolelist()
  getdeptlist()
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