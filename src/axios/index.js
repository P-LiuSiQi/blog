import axios from 'axios'

const dealParams = function (params) {
  for (let key in params) {
    if (typeof key === 'object' || typeof key !== 'function') {
      dealParams(params[key])
    }
    if (params[key] === null) {
      delete params[key];
    }
  }
}

const request = function (url, params) {
  return new Promise(axios({
    get: {
      method: 'GET',
      url: url,
      data: params
    },
    post: {
      method: 'POST',
      url: url,
      data: params
    }
  }))
}
export default request