import request from '../utils/request';

export async function queryServerMap() {
  return request('/api/server-map');
}
