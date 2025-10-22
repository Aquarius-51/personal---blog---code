<template>
  <div class="role-manger">
    <el-form :inline="true" ref="roleuserRuleFormRef" :model="roleRuleForm" label-width="120px"
      class="demo-userRuleForm mt-5 mb-8" :size="formSize" status-icon>
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model.trim="roleRuleForm.roleName" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="userSubmitForm(roleuserRuleFormRef)">
          查询
        </el-button>
        <el-button @click="resetForm(roleuserRuleFormRef)">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="control-button mt-10 mb-12">
      <el-button type="primary" @click="handleCreate">创建</el-button>
    </div>
    <div class="role-table">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column :label="item.label" :prop="item.property" :formatter="item.formatter"
          v-for="(item, t) in columns" :key="t" />
        <el-table-column align="center" label="操作">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="primary" @click="setPermission(scope.row)">设置权限</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="pager.currentPage" v-model:page-size="pager.pageSize"
        :page-sizes="[1, 3, 5, 7, 10]" :small="small" :disabled="disabled" :background="background"
        layout="total, sizes, prev, pager, next, jumper" :total="pager.total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
      <!-- 对话框1-创建角色 -->
      <el-dialog v-model="dialogVisible" @close="closeDialog" :title="active == 'create' ? '创建' : '编辑'" width="45%"
        draggable>
        <div>
          <el-form ref="DialogRuleFormRef" :model="DialogRuleForm" :rules="rules" label-width="90px" class="demo-ruleForm"
            :size="formSize" status-icon>
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="DialogRuleForm.roleName" placeholder="请输入您的角色名称" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="DialogRuleForm.remark" placeholder="请输入您的备注内容" />
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="roleOperateForm(DialogRuleFormRef)">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
      <!-- 对话框2-设置权限 -->
      <el-dialog v-model="permissionDialogVisible" @close="closeDialog" title="设置权限" width="45%" draggable>
        <div class="pb-4">角色名称:{{ rolename }}</div>
        <div class="mt-3">
          <el-tree ref="treeRef" :data="roleData" show-checkbox node-key="_id" default-expand-all :props="defaultProps" />
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="permissionDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="permissionRoleOperateForm">
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
import { List } from 'echarts';
//顶部form
const formSize = ref('default')
const roleuserRuleFormRef = ref<FormInstance>()
const roleRuleForm = reactive<userRuleForm>({
  roleName: ''
})
//查询
const userSubmitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      getrolelist()
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

//user操作按钮
//创建
const handleCreate = () => {
  dialogVisible.value = true
  active.value = 'create'
}
//table
const tableData: any = ref([])
//编辑
const handleEdit = (row: any) => {
  active.value = 'edit'
  nextTick(() => {
    Object.assign(DialogRuleForm, row)
  })
  dialogVisible.value = true
}
//设置权限
let rolename = ref()
let currentId = ref()
const setPermission = (row: any) => {
  console.log(row);

  let { checkKeys } = row.permissionList
  rolename.value = row.roleName
  currentId.value = row._id
  setTimeout(() => {
    treeRef.value.setCheckedKeys(checkKeys, false)
  }, 100)

  permissionDialogVisible.value = true

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
      Api.getRoleDeleteList({ _id: row._id }).then(res => {
        if (res) {
          getrolelist()
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
const columns = [
  {
    label: '角色名称',
    property: 'roleName'
  },
  {
    label: '备注',
    property: 'remark'
  },
  {
    label: '权限列表',
    property: 'permissionList',
    formatter: function (_row: any, _column: any, cellValue: any, _index: any) {
//  actionMap
// 65966a0dfefcc8b40f0923de: "部门管理"
// 65966a32fefcc8b40f0923e1: "图表管理"
// 65966a56fefcc8b40f0923e4: "上传图片"
// 65966a82fefcc8b40f0923e7: "打卡管理"
// 659669d6fefcc8b40f0923d8: "菜单管理"
// 659669ecfefcc8b40f0923db: "角色管理"
// 6596771dc78410a10f3cfa2a: "审批休假"
// 65966322d899b2c4454f3b8d: "用户管理"
// 65967702c78410a10f3cfa27: "待审批管理"
      //  第一步 解构cellvalue
      const {halfCheckKeys} = cellValue
      let names = ref<string[]>([])
      //  第二步 遍历查找 _id
      halfCheckKeys.map((key:any)=>{
      //  第三步 映射actionMap.value
        let list:string = actionMap.value[key] 
        console.log(list);
        if(list as string){
          names.value.push(list)
        }
      })
      return names.value.join(',')
    }
  },
  {
    label: '更新时间',
    property: 'updateTime'
  },
  {
    label: '创建时间',
    property: 'createTime'
  }
]

//分页
const pager = reactive({
  currentPage: 1,//当前页
  pageSize: 10,//一页多少条数据
  total: 0//总条数
})
const small = ref(false)
const background = ref(false)
const disabled = ref(false)
const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
  pager.pageSize = val
  getrolelist()
}
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
  pager.currentPage = val
  getrolelist()
}
//对话框1-创建角色
const dialogVisible = ref(false)
const active = ref('create')
const DialogRuleFormRef = ref<FormInstance>()
const DialogRuleForm = reactive<DialogRuleForm>({
  roleName: '',
  remark: ''
})

//关闭对话框
const closeDialog = () => {
  resetForm(DialogRuleFormRef.value)
}
//表单验证
const rules = reactive<FormRules<DialogRuleForm>>({
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 10, message: '角色名称长度为2-10之间', trigger: 'blur' },
  ],
})

//创建或编辑确定
const roleOperateForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      let params: any = DialogRuleForm;
      params.active = active.value;
      console.log(params);
      Api.getRoleOperateList(params).then(res => {
        if (res) {
          dialogVisible.value = false
          getrolelist()
        }
      })
    } else {
      console.log('error submit!', fields)
    }
  })
}
//对话框2-设置权限
let treeRef = ref()
const permissionDialogVisible = ref(false)
const permissionRoleOperateForm = () => {
  let nodes = treeRef.value.getCheckedNodes()//选中的是全选的按钮或者菜单
  let halfkeys = treeRef.value.getHalfCheckedKeys()//半选中的菜单
  let checkKeys: any = []//按钮的ID
  let parentKeys: any = []//全选中的菜单的ID
  nodes.map((node: roleRootObject) => {
    if (!node.children) {
      //按钮
      checkKeys.push(node._id)
    } else {
      //菜单
      parentKeys.push(node._id)
    }
  })
  let params = {
    _id: currentId.value,
    permissionList: {
      checkKeys: checkKeys,//全选 按钮
      halfCheckKeys: halfkeys.concat(parentKeys)//半选 菜单
    },
  }
  Api.setPermissionList(params).then((res: any) => {
    console.log(res);
    if (res.code == 200) {
      ElMessage({
        type: 'success',
        message: '设置成功',
      })
    }
    getrolelist()
  })
  permissionDialogVisible.value = false
}
//获取二级菜单并做字典映射
const actionMap = ref<any>({})
const getActionMap = (list: any) => {
  const deep = (data: any) => {
    console.log(data);
    while (data.length) {
      let item = data.pop()
      if (item.children&&item.action) {//一级菜单
        deep(item.children)
      } else {//二级菜单
        //js字典映射
        actionMap.value[item._id] = item.menuName
        //actionMap代表拿到了所有的二级菜单的映射
        console.log('actionMap',actionMap);
        
      }
    }
  }
  deep(JSON.parse(JSON.stringify(list)))
}

const defaultProps = {
  children: 'children',
  label: 'menuName',
}
const roleData = ref([])
//请求
const getrolelist = () => {
  Api.getRoleList({ ...roleRuleForm, ...pager }).then((res: any) => {
    let { list, total } = res
    tableData.value = list
    pager.total = total
  })
}
const getmenulist = () => {
  Api.getMenuList().then((res: any) => {
    console.log(res);
    roleData.value = res
    getActionMap(res)
  })
}
onMounted(() => {
  getrolelist()
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