import { DataSet } from 'choerodon-ui/pro';

export default ({ intl, intlPrefix }) => {
  const queryPredefined = new DataSet({
    autoQuery: true,
    paging: false,
    fields: [
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    data: [
      { key: 'S', value: intl.formatMessage({ id: 'boot.success' }) },
      { key: 'F', value: intl.formatMessage({ id: 'boot.failed' }) },
      { key: 'P', value: intl.formatMessage({ id: `${intlPrefix}.ready` }) },
    ],
  });
  const webhookUrl = intl.formatMessage({ id: `${intlPrefix}.MsgWebhook.url` });
  const status = intl.formatMessage({ id: `${intlPrefix}.status` });
  const failedReason = intl.formatMessage({ id: `${intlPrefix}.failedReason` });
  const templateType = intl.formatMessage({ id: `${intlPrefix}.templateType` });
  const creationDate = intl.formatMessage({ id: `${intlPrefix}.creationDate` });
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
      { name: 'creationDate', type: 'string', label: creationDate },
      { name: 'statusMeaning', type: 'string', label: status },
      { name: 'failedReason', type: 'string', label: failedReason },
      { name: 'messageName', type: 'string', label: templateType },
      { name: 'webhookAddress', type: 'string', label: webhookUrl },
    ],
    queryFields: [
      {
        name: 'status', type: 'string', label: status, textField: 'value', valueField: 'key', options: queryPredefined,
      },
      { name: 'failedReason', type: 'string', label: failedReason },
      { name: 'messageName', type: 'string', label: templateType },
      { name: 'webhookAddress', type: 'string', label: webhookUrl },
    ],
  });
};
