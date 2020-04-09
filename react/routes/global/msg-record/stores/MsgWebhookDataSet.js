export default () => ({
  autoQuery: true,
  selection: false,
  transport: {
    read: {
      url: '/notify/v1/records/web_hook_records',
      method: 'post',
    },
  },
  fields: [
    { name: 'sendTime', type: 'date', label: '发送时间' },
    { name: 'status', type: 'string', label: '状态' },
    { name: 'failedReason', type: 'string', label: '失败原因' },
    { name: 'sourceName', type: 'string', label: '组织/项目' },
    { name: 'webhookPath', type: 'string', label: 'webhook地址' },
  ],
  queryFields: [
    { name: 'sendTime', type: 'date', label: '发送时间' },
    { name: 'status', type: 'string', label: '状态' },
    { name: 'failedReason', type: 'string', label: '失败原因' },
    { name: 'sourceName', type: 'string', label: '组织/项目' },
    { name: 'webhookPath', type: 'string', label: 'webhook地址' },
  ],
});
