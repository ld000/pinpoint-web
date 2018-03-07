import request from '../utils/request';

export async function queryApplicationList() {
  return request('/getAgentList.pinpoint');
}
