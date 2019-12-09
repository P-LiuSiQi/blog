import axios from 'axios'
import config from './config'
import { session } from '../libs/location'
import { Toast } from 'vant'

function toType(params) {
  return ({}).toString.call(params).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

const dealParams = function (params) {
  for (let key in params) {
    if (params[key] === null) {
      delete params[key]
    }
    if (toType(params[key] === 'string')) {
      params[key] = params[key].trim()
    } else if (toType(params[key] === 'object')) {
      params[key] = dealParams(params[key])
    } else if (toType(params[key] === 'array')) {
      params[key] = dealParams(params[key])
    }
  }
  return params
}

// axios 全局变量
axios.defaults.baseURL = config.baseUrl
axios.defaults.timeout = config.timeout
// axios.defaults.withCredentials = config.widthCredentials // 让ajax携带cookie

// 请求拦截器
axios.interceptors.request.use(function (config) {
 let initParams = session.parseJSON()
 config.headers.common['authorization-token'] = initParams === null ? '' : initParams.token
 config.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

 return config
}, function (err) {
  return Promise.reject(err)
})

// 响应拦截器
axios.interceptors.request.use(function (res) {
  let data = res

  // 根据返回的code值来做不同的处理
  switch (data.code) {
    case 0:
      const message = data.msg || 'Error'
      Toast.fail({
        message,
        duration: 1000
      })
      return Promise.reject(message)
    default:
      break;
  }
  return data
}, function (err) {
  if (err && err.response) {
    switch (err.response.status) {
      case 400:
        err.message = '请求错误'
      break
      case 401:
        err.message = '未授权，请登录'
      break
      case 403:
        err.message = '拒绝访问'
      break
      case 404:
        err.message = `请求地址出错: ${err.response.config.url}`
      break
      case 408:
        err.message = '请求超时'
      break
      case 500:
        err.message = '服务器内部错误'
      break
      case 501:
        err.message = '服务未实现'
      break
      case 502:
        err.message = '网关错误'
      break
      case 503:
        err.message = '服务不可用'
      break
      case 504:
        err.message = '网关超时'
      break
      case 505:
        err.message = 'HTTP版本不受支持'
      break
      default:
    }
  }
  Toast(errmsg)
  return Promise.reject(err) // 返回错误信息
})

export const request = {
  get: function (url, data) {
    if (data) {
      data = dealParams(data)
    }
    let config = {
      method: 'get',
      url: url,
      params: data || {/* get请求参数 */}
    }
    return axios(config)
  },
  post: function (url, data) {
    if (data) {
      data = dealParams(data)
    }
    let config = {
      method: 'post',
      url: url,
      data: data || {/* post请求参数 */}
    }
    return axios(config)
  },
  multRequest: function (config) {
    let allReq = []
    if (config.length > 0) {
      for (let item of config) {
        if (item.method === 'get') {
          allReq.push(axios.get(item.url, { params: item.data }))
        } else if (item.method === 'post') {
          allReq.push(axios.post(item.url, item.data))
        }
      }
    }
    return axios.all(allReq)
  }
}