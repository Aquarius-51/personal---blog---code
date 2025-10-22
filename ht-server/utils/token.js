const jwt=require('jsonwebtoken')
 
const secret='lee'  // 密钥
/*
expiresIn:5 过期时间，时间单位是秒
也可以这么写 expiresIn:1d 代表一天
1h 代表一小时
*/
// 本次是为了测试，所以设置时间 短token5秒 长token15秒
const accessTokenTime='10h'
const refreshTokenTime='20h'
 
// 生成accessToken
const setAccessToken=(payload)=>{  // payload 携带用户信息
     return jwt.sign(payload,secret,{expiresIn:accessTokenTime})
}
//生成refreshToken
const setRefreshToken=(payload)=>{
    return jwt.sign(payload,secret,{expiresIn:refreshTokenTime})
}
 
module.exports={
    secret,
    setAccessToken,
    setRefreshToken
}