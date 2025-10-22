import {
    defineStore
} from 'pinia'
export const loginStore = defineStore('login', {
    state() {
        return {
            userInfo:JSON.parse(window.sessionStorage.getItem('userinfo')||'{}')
        }
    },
    getters: {

    },
    actions: {
        setUserInfo(payload:any){
            this.userInfo = payload
            window.sessionStorage.setItem('userinfo',JSON.stringify(payload))
        },
        clearUserInfo(){
            window.sessionStorage.removeItem('userinfo')
        }
    }
})
