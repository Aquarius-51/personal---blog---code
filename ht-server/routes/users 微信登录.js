const router = require('koa-router')()
const User = require('../model/userSchema.js')
const koa2Req = require('koa2-request')
router.prefix('/users')
// http://localhost:3000/api/users/login
router.post('/login', async (ctx) => {
	let appId = 'wx6dad42c6d3c49791';
	let secret = '7fa1601ff9ec562406f3823fc300ec5e'
	const {
		code,
		nickname,
		avatar
	} = ctx.request.body
	console.log('nickname',nickname);
	// 组合url
	let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appId + '&secret=' + secret +
		'&js_code=' + code + '&grant_type=authorization_code'
	// 向微信服务器发送请求
	let res2 = await koa2Req(url);
	// 获取session_key和openid
	const {
		session_key,
		openid
	} = JSON.parse(res2.body);
	const token = '4535jjfsjdfwt43t345l34jlk34jlj34ltjo44j0weffpsdd'
	console.log(session_key, openid);
	let res = await User.findOne({
		openid
	})
	console.log('res=>', res);
	if (res == null) {
		await User.create({
			nickname,
			avatar,
			token,
			session_key,
			openid
		})
	} else {
		let res = await User.findOneAndUpdate({
			openid: openid
		}, {
			$set: {
				'nickname': nickname,
				'openid': openid,
				'session_key': session_key,
				'avatar': avatar,
				'token':token,
				'lastLoginTime': new Date()
			}
		}, {
			new: true
		})
	}
	ctx.body = {
		data: {
			openid,
			session_key,
			nickname,
			token,
			avatar
		},
		msg: 'ok',
		statusCode: 200
	}
})

module.exports = router