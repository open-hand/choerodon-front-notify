export default () => ({
  autoQuery: true,
  selection: false,
  transport: {
    read: {
      url: '/hmsg/choerodon/v1/mails/records/webhooks',
      method: 'get',
    },
  },
  fields: [
    { name: 'creationDate', type: 'date', label: '发送时间' },
    { name: 'statusMeaning', type: 'string', label: '状态' },
    { name: 'failedReason', type: 'string', label: '失败原因' },
    { name: 'messageName', type: 'string', label: '模板类型' },
    { name: 'webhookAddress', type: 'string', label: 'webhook地址' },
  ],
  queryFields: [
    { name: 'creationDate', type: 'date', label: '发送时间' },
    { name: 'statusMeaning', type: 'string', label: '状态' },
    { name: 'failedReason', type: 'string', label: '失败原因' },
    { name: 'messageName', type: 'string', label: '模板类型' },
    { name: 'webhookAddress', type: 'string', label: 'webhook地址' },
  ],
});
