import { DataSet } from 'choerodon-ui/pro';

export default () => {
  const queryPredefined = new DataSet({
    autoQuery: true,
    paging: false,
    fields: [
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    data: [
      { key: 'S', value: '成功' },
      { key: 'F', value: '失败' },
      { key: 'P', value: '就绪' },
    ],
  });

  return ({
    autoQuery: true,
    selection: false,
    transport: {
      read: {
        url: '/hmsg/choerodon/v1/mails/records/webhooks',
        method: 'get',
      },
    },
    fields: [
      { name: 'creationDate', type: 'string', label: '发送时间' },
      { name: 'statusMeaning', type: 'string', label: '状态' },
      { name: 'failedReason', type: 'string', label: '失败原因' },
      { name: 'messageName', type: 'string', label: '模板类型' },
      { name: 'webhookAddress', type: 'string', label: 'webhook地址' },
    ],
    queryFields: [
      {
        name: 'status', type: 'string', label: '状态', textField: 'value', valueField: 'key', options: queryPredefined,
      },
      { name: 'failedReason', type: 'string', label: '失败原因' },
      { name: 'messageName', type: 'string', label: '模板类型' },
      { name: 'webhookAddress', type: 'string', label: 'webhook地址' },
    ],
  });
};
