import fetch from 'isomorphic-fetch'
import { API_PREFIX, API_SUFFIX } from '../constants'

// todo : 连接store
const code = global.STAFF.code

export function fetchJSON(url, params, type) {
  // eslint-disable-next-line no-param-reassign
  params = {
    ...params,
    credentials: 'include',
    headers: {
      'User-Code': code,
      'X-Requested-With': 'XMLHttpRequest',
      Connection: 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      ...params.headers,
    },
  }
  if (!~url.indexOf('http://')) {
    // eslint-disable-next-line no-param-reassign
    url = type === 'GET' ? `${API_PREFIX}${url}` : `${API_PREFIX}${url}${API_SUFFIX}`
  }
  typeof params.body === 'string' ? params.body = params.body.replace(/\+/g, '%2B') : ''
  return fetch(url, params)
}
function buildParams(obj) {
  if (!obj) {
    return ''
  }
  const params = []
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if ({}.hasOwnProperty.call(obj, key)) {
      const value = obj[key] === undefined ? '' : obj[key]
      params.push(`${key}=${value}`)
    }
  }
  return params.join('&')
}

function buildURL(url, data) {
  return url.split('/').map(item => {
    if (item.indexOf('$') > -1) {
      return data[item.split('$')[1]]
    }
    return item
  }).join('/')
}

// eslint-disable-next-line arrow-parens
export const fetchJSONByPost = url => query => {
  const params = {
    method: 'POST',
    body: buildParams(query),
  }
  const buildUrl = buildURL(url, query)
  return fetchJSON(buildUrl, params)
}

export const fetchJSONByGet = url => query => {
  const params = {
    method: 'GET',
  }
  let getQuery = '?'
  if (query) {
    // eslint-disable-next-line
    for (name in query) {
      getQuery = `${getQuery}${name}=${query[name]}&`
    }
  }
  const buildUrl = buildURL(url, query)
  // eslint-disable-next-line
  const getUrl = buildUrl + '.json' + (query ? getQuery.substring(0, getQuery.length - 1) : '')
  return fetchJSON(getUrl, params, 'GET')
}

export const fetchJSONStringByPost = url => query => {
  const params = {
    method: 'POST',
    body: query,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  }
  return fetchJSON(url, params)
}

