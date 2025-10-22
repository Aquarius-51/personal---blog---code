<template>
  <div class="leave-manager">
    <el-form :model="leavemanagerform" label-width="120px" ref="ruleFormRef" :inline="true">
      <el-form-item label="审批状态" prop="applyState">
        <el-select v-model="leavemanagerform.applyState" placeholder="请输入审批状态">
          <el-option :label="item.label" :value="item.value" v-for="item in options" :key="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="queryForm"> 查询 </el-button>
        <el-button @click="resetForm(ruleFormRef)">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="leave-table">
      <div class="leave-button">
        <el-button type="primary" @click="handleLeave">审批休假</el-button>
      </div>
      <el-table :data="leaveTableData" style="width: 100%">
        <el-table-column v-for="(item, index) in columns" :key="index" :label="item.label" :property="item.property"
          :width="item.width" :formatter="item.formatter" />
        <el-table-column label="操作" width="240px">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)"
              v-if="leavemanagerform.applyState !== 5">作废</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="pager.currentPage" v-model:page-size="pager.pageSize" :page-sizes="[1, 3, 5, 10]"
        :small="small" :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper"
        :total="pager.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
    <el-dialog v-model="leaveCenterDialogVisible" title="审批休假" width="50%" align-center @close="closeDialog">
      <el-form ref="dialogRuleFormRef" :model="ruleForm" :rules="rules" label-width="120px" class="demo-ruleForm"
        :size="formSize" status-icon>
        <el-form-item label="休假类型" prop="applyType">
          <el-select v-model="ruleForm.applyType" placeholder="请输入休假类型">
            <el-option :label="item.label" :value="item.value" v-for="item in option" :key="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="休假时间" prop="allTime">
          <el-config-provider :locale="locale">
            <el-date-picker v-model="ruleForm.allTime" type="datetimerange" range-separator="-"
              start-placeholder="Start date" end-placeholder="End date" @change="handelChangeTime" />
          </el-config-provider>
        </el-form-item>
        <el-form-item label="休假时长">
          <span>{{ leaveTime }}天</span>
        </el-form-item>
        <el-form-item label="休假原因" prop="reasons">
          <el-input type="textarea" autosize v-model="ruleForm.reasons" placeholder="请输入休假原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userCancel">取消</el-button>
          <el-button type="primary" @click="leaveDialogSubmit(dialogRuleFormRef)">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="leaveDialogVisible" title="申请休假详情" width="55%" @close="closeDialog">
      <el-steps :active="detail.applyState > 2 ? 3 : detail.applyState" align-center v-if="leavemanagerform.applyState !== 5">
        <el-step title="待审批" />
        <el-step title="审批中" />
        <el-step title="审批通过/审批拒绝" />
      </el-steps>
      <el-form class="demo-ruleForm" ref="leaveRuleFormRef" :model="leaveRuleForm" label-width="120px" :size="formSize"
        status-icon>
        <el-form-item>
          <span>休假类型：{{ detail.applyType }}</span>
        </el-form-item>
        <el-form-item>
          <span>休假时间：{{ detail.time }}</span>
        </el-form-item>
        <el-form-item>
          <span>休假时长：{{ detail.leaveTime }}</span>
        </el-form-item>
        <el-form-item>
          <span>休假原因：{{ detail.reasons }}</span>
        </el-form-item>
        <el-form-item>
          <span>审批状态：{{ detail.applyStateName }}</span>
        </el-form-item>
        <el-form-item>
          <span>申请人：{{ detail.applyUser.userName }}</span>
        </el-form-item>
        <el-form-item>
          <span>审核人：{{ detail.curAuditUserName }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="leaveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="leaveSubmit"> 确定 </el-button>
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
// import zhCn from "element-plus/es/locale/lang/zh-cn";
let locale = ref(zhCn)
const leavemanagerform = reactive({
  applyState: 1,
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

//创建
const handleLeave = () => {
  action.value = "create";
  leaveCenterDialogVisible.value = true;
};
//打开查看按钮
let detail = ref<any>({})
const handleView = (row: interLeaveObject) => {
  console.log(row);
  let data = { ...row }
  console.log(data);

  detail.value = data
  console.log(detail.value);

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
  detail.value.applyStateName = {
    "1": "待审批",
    "2": "审批中",
    "3": "审批通过",
    "4": "审批拒绝",
    "5": "作废"
  }[data.applyState]
  detail.value.time = `${utils.formateDate(
    new Date(row.allTime[0])
  )}-${utils.formateDate(new Date(row.allTime[1]))}`
  leaveDialogVisible.value = true;
};
//作废
const handleDelete = (row: User) => {
  action.value = 'drop'
  ElMessageBox.confirm("您确定要作废吗?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      Api.getLeaveOperate({ _id: row._id }).then((res: any) => {
        if (res.code == 200) {
          ElMessage({
            type: "success",
            message: "作废成功",
          });
          getleavelist();
        }
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消作废",
      });
    });
};
const columns: any = [
  {
    label: "单号",
    property: "orderNo",
    width: "200px",
  },
  {
    label: "休假时间",
    property: "allTime",
    width: "320px",
    formatter(_row: string, _column: string, cellValue: string) {
      let startTime = cellValue[0]
      let endTime = cellValue[1]
      return `${utils.formateDate(new Date(startTime))}-${utils.formateDate(new Date(endTime))}`;
    },
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
        "8": "调休",
      }[cellValue]
    },

  },
  {
    label: "休假原因",
    property: "reasons"

  },
  {
    label: "创建时间",
    property: "createTime",
    width: "240px",
    formatter(_row: string, _column: string, cellValue: string) {
      return utils.formateDate(new Date(cellValue));
    },
  },
];
const leaveTableData = ref([]); //table数据
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
//创建对话框
const action = ref<string>("create"); //默认创建
const leaveCenterDialogVisible = ref(false); //默认对话框关闭
const formSize = ref("default");
const dialogRuleFormRef = ref<FormInstance>();
const ruleForm = reactive({
  applyType: "",//休假类型
  allTime: "",//休假时间
  reasons: "",//休假原因
});
const option = [
  {
    value: 1,
    label: "事假",
  },
  {
    value: 2,
    label: "病假",
  },
  {
    value: 3,
    label: "丧假",
  },
  {
    value: 4,
    label: "婚假",
  },
  {
    value: 5,
    label: "产假",
  },
  {
    value: 6,
    label: "陪产假",
  },
  {
    value: 7,
    label: "年假",
  },
  {
    value: 8,
    label: "调休",
  },
]
// 日期时间选择器
const rules = reactive<FormRules>({
  applyType: [
    { required: true, message: "请输入休假类型", trigger: "blur" },
  ],
  allTime: [
    { required: true, message: "休假时间必填", trigger: "blur" },
  ],
});
let leaveTime = ref<any>(0)
const handelChangeTime = (e: any) => {
  console.log(e);
  const startTime = e[0]
  const endTime = e[1]
  leaveTime.value = ((endTime - startTime) / (24 * 60 * 60 * 1000)).toFixed(2)
}
//关闭对话框的回调
const closeDialog = () => {
  //方法一
  leaveCenterDialogVisible.value = false;
  setTimeout(() => {
    resetForm(dialogRuleFormRef.value);//重置
  }, 200);
  //方法二
  // for (let key in ruleForm) {
  //   ruleForm[key] = "";
  // }
};
//取消对话框
const userCancel = () => {
  leaveCenterDialogVisible.value = false;
};

//提交对话框
const leaveDialogSubmit = async (formEl: FormInstance | undefined | null) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      const params: any = ruleForm;
      params.leaveTime = leaveTime.value;
      params.action = action.value
      Api.getLeaveOperate(params).then((res: any) => {
        console.log('resdept',res);
        
        if (res.code == 200) {
          getleavelist();
          leaveCenterDialogVisible.value = false;
        }
      });
    } else {
      console.log("error submit!", fields);
    }
  });
};
//查看对话框
const leaveRuleFormRef = ref<FormInstance>()
const leaveRuleForm = reactive({

})
const leaveDialogVisible = ref<Boolean>(false);
const leaveSubmit = () => {
  leaveDialogVisible.value = false;
};

//请求数据
onMounted(() => {
 getleavelist();
});
//请求table列表
const getleavelist = () => {
  Api.getLeaveList({ ...leavemanagerform, ...pager }).then((res: any) => {
    console.log('res',res);
    
    leaveTableData.value = res.list;
    pager.total = res.total;
  });
};
</script>
<style scoped>
.el-form {
  padding: 22px 0 0 0;
}

.leave-table {
  margin: 22px 0 0 0;
  padding: 22px;
  box-sizing: border-box;
}

.leave-button {
  padding: 0 0 22px 0;
}

.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>