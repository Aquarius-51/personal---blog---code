interface interA {
    [props: string]: string | number
}
interface interConfig {
    [key: string]: interDev
}
interface interDev {
    baseApi: string
    mockApi?: string
}
interface interLoginRuleForm {
    userName: string
    userPwd: string
    captcha:string
}
interface userRuleForm {
    [props: string]: string | number
}
interface interTable {
    [props: string]: string | number
}
interface DialogRuleForm {
    [props: string]: string | number
}
interface DialogMenuRuleForm {
    [props: string]: string | number|null[]
}
interface DialogdeptRuleForm {
    [props: string]: string | number|null[]
}
interface InterParams {
    type?:string;
    state?:number
}
interface interUserName {
    _id?:string;
    userId?:string;
    userName?:string;
    userEmail?:string
}
interface roleRootObject {
    children: Child[];
    component: string;
    createTime: string;
    icon: string;
    menuCode: string;
    menuName: string;
    menuState: number;
    menuType: number;
    parentId: string[];
    path: string;
    updateTime: string;
    __v: number;
    _id: string;
  }
  
  interface Child {
    component: string;
    createTime: string;
    icon: string;
    menuCode: string;
    menuName: string;
    menuState: number;
    menuType: number;
    parentId: string[];
    path: string;
    updateTime: string;
    __v: number;
    _id: string;
  }
  interface interLeaveObject {
    [props?: string]: string | number;
    allTime:string[];
    applyUser?: ApplyUser;
}
interface User {
    roleName: string,
    [props?: string]: string | number
}