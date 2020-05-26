import { DataSet } from 'choerodon-ui/pro/lib';

export default function (templateDataSet) {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    autoQueryAfterSubmit: false,
    children: {
      messageTemplateVOS: templateDataSet,
    },
    fields: [
      { name: 'enabled', type: 'boolean' },
      { name: 'allowConfig', type: 'boolean', label: '是否允许配置接收' },
      { name: 'isSendInstantly', type: 'boolean', label: '是否即时发送' },
      { name: 'retryCount', type: 'number', label: '邮件默认重发次数' },
      { name: 'isManualRetry', type: 'boolean', label: '是否允许手动触发邮件' },
      { name: 'backlogFlag', type: 'boolean', label: '是否为代办提醒' },
      { name: 'emailEnabledFlag', type: 'boolean', label: '邮件' },
      { name: 'pmEnabledFlag', type: 'boolean', label: '站内信' },
      { name: 'webhookEnabledFlag', type: 'boolean', label: 'webhook-钉钉微信' },
      { name: 'webhookJsonEnabledFlag', type: 'boolean', label: 'webhook-Json' },
      { name: 'smsEnabledFlag', type: 'boolean', label: '短信' },
    ],
    transport: {
      read: ({ data: { tempServerId } }) => ({
        url: '/hmsg/choerodon/v1/notices/send_settings/detail',
        method: 'get',
        transformResponse(data) {
          const newData = JSON.parse(data);
          Object.keys(newData).forEach((k) => {
            if (k.includes('EnabledFlag')) {
              if (newData[k]) {
                newData[k] = true;
              } else {
                newData[k] = false;
              }
            }
          });
          if (!newData.messageTemplateVOS) {
            newData.messageTemplateVOS = [];
          }
          return newData;
        },
      }),
      update: ({ data: [data] }) => {
        Object.keys(data).forEach((k) => {
          if (k.includes('EnabledFlag')) {
            if (data[k]) {
              data[k] = 1;
            } else {
              data[k] = 0;
            }
          }
        });
        return (
          {
            url: `/hmsg/choerodon/v1/notices/send_settings/${data.tempServerId}/send_setting`,
            method: 'put',
            data,
          }
        );
      },
    },
  };
}
