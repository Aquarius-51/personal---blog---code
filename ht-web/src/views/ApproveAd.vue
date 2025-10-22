<template>
  <div class="approve-manager">
    <el-form :model="approvemanagerform" label-width="120px" ref="ruleFormRef" :inline="true">
      <el-form-item label="审批状态" prop="applyState">
        <el-select v-model="approvemanagerform.applyState" placeholder="请输入审批状态">
          <el-option :label="item.label" :value="item.value" v-for="item in options" :key="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="queryForm"> 查询 </el-button>
        <el-button @click="resetForm(ruleFormRef)">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="approve-table">
      <el-table :data="approveTableData" style="width: 100%">
        <el-table-column v-for="(item, index) in columns" :key="index" :label="item.label" :property="item.property"
          :width="item.width" :formatter="item.formatter" />
        <el-table-column label="操作" width="240px">
          <template #default="scope">
            <el-button size="small" @click="handleAudit(scope.row)">审核</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="pager.currentPage" v-model:page-size="pager.pageSize" :page-sizes="[1, 3, 5, 10]"
        :small="small" :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper"
        :total="pager.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
    <el-dialog v-model="approveDialogVisible" title="审核" width="55%">
      <el-form class="demo-ruleForm" ref="approveRuleFormRef" :model="approveRuleForm" label-width="120px" status-icon>
        <el-form-item label="休假类型：">
          <span>{{ detail.applyType }}</span>
        </el-form-item>
        <el-form-item label="休假时间：">
          <span>{{ detail.time }}</span>
        </el-form-item>
        <el-form-item label="休假时长：">
          <span>{{ detail.leaveTime }}</span>
        </el-form-item>
        <el-form-item label="休假原因：">
          <span>{{ detail.reasons }}</span>
        </el-form-item>
        <el-form-item label="审批状态：">
          <span>{{ detail.applyState }}</span>
        </el-form-item>
        <el-form-item label="申请人：">
          <span>{{ detail.applyUser.userName }}</span>
        </el-form-item>
        <el-form-item label="审核：">
          <span>{{ detail.curAuditUserName}}</span>
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input type="textarea" :rows="3" v-model="approveRuleForm.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleApprove('pass', approveRuleFormRef)"
            >审核通过</el-button
          >
          <el-button @click="handleApprove('refuse', approveRuleFormRef)" type="primary"
            >驳回</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  reactive,
  computed,
  toRefs,
  onMounted,
  nextTick,
  toRaw,
} from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import utils from "./../utils/utils";
import Api from "./../api";
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
let locale = ref(zhCn)
const approvemanagerform = reactive({
  applyState: 1,
  type:'approve'
});
const ruleFormRef = ref<FormInstance>();
//查询
const queryForm = () => {
  getleavelist()
};
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//options
const options = [
  {
    value: 0,
    label: "全部",
  },
  {
    value: 1,
    label: "待审批",
  },
  {
    value: 2,
    label: "审批中",
  },
  {
    value: 3,
    label: "审批通过",
  },
  {
    value: 4,
    label: "审批拒绝",
  },
  {
    value: 5,
    label: "作废",
  },
];
//table
//打开审核按钮
let detail = ref<any>({})
const handleAudit = (row: interLeaveObject) => {
  console.log(row);
  let data = {...row}
  console.log(data);
  
  detail.value = data
  detail.value.applyType = {
    "1": "事假",
    "2": "病假",
    "3": "丧假",
    "4": "婚嫁",
    "5": "产假",
    "6": "陪产假",
    "7": "年假",
    "8": "调休"
  }[data.applyType]
  detail.value.applyState = {
    "1": "待审批",
    "2": "审批中",
    "3": "审批通过",
    "4": "审批拒绝",
    "5": "作废"
  }[data.applyState]
  detail.value.time = `${utils.formateDate(
    new Date(row.allTime[0])
  )}-${utils.formateDate(new Date(row.allTime[1]))}`
  approveDialogVisible.value = true;
};
const columns: any = [
  {
    label: "单号",
    property: "orderNo",
    width: "140px",
  },
  {
    label: "休假时间",
    property: "allTime",
    width: "180px",
    formatter(_row: string, _column: string, cellValue: string) {
      let startTime = cellValue[0]
      let endTime = cellValue[1]
      return `${utils.formateDate( new Date(startTime))}-${utils.formateDate(new Date(endTime))}`;
    }
  },
  {
    label: "休假时长",
    property: "leaveTime"

  },
  {
    label: "休假类型",
    property: "applyType",
    formatter(_row: string, _column: string, cellValue: string) {
      return {
        "1": "事假",
        "2": "病假",
        "3": "丧假",
        "4": "婚嫁",
        "5": "产假",
        "6": "陪产假",
        "7": "年假",
        "8": "调休"
      }[cellValue]
    },

  },
  {
    label: "休假原因",
    property: "reasons",
    width: "180px",
  },
  {
    label: "申请时间",
    property: "createTime",
    width: "200px",
    formatter(_row: string, _column: string, cellValue: string) {
      return utils.formateDate(new Date(cellValue));
    },
  },
  {
    label: "审批人",
    property: "auditUsers",
    width: "200px",
  },
  {
    label: "当前审批人",
    property: "curAuditUserName"

  },
];
const approveTableData = ref([]); //table数据
//分页
const pager = reactive({
  currentPage :1,//当前页
  pageSize :10,//一页多少条数据
  total:0//总条数
});
const small = ref(false);
const background = ref(false);
const disabled = ref(false);
const handleSizeChange = (val: number) => {
  pager.pageSize = val;
};
const handleCurrentChange = (val: number) => {
  pager.currentPage = val;
};
//审核对话框
const approveRuleFormRef = ref<FormInstance>()
const approveRuleForm = reactive({
  remark: "",
})
const approveDialogVisible = ref<Boolean>(false);
//审批拒绝或审批通过
const handleApprove = (action:any,_formEl:any) => {
  let params = {
    _id:detail.value._id,
    action:action,
    remark:approveRuleForm.remark
  }
  Api.getApprove(params).then((res:any)=>{
    console.log(res);
    if(res.code ==200){
      getleavelist();
    }
  })
  approveDialogVisible.value = false;
};

//请求数据
onMounted(() => {
  getleavelist();
});
//请求table列表
const getleavelist = () => {
  Api.getLeaveList({ ...approvemanagerform, ...pager }).then((res: any) => {
    approveTableData.value = res.list;
    pager.total = res.total;
  });
};
</script>
<style scoped>
.el-form {
  padding: 22px 0 0 0;
}

.approve-table {
  margin: 22px 0 0 0;
  padding: 22px;
  box-sizing: border-box;
}

.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>