import { DataSet } from 'choerodon-ui/pro/lib';

const getTypePath = (type, orgId, method = 'get') => {
  const path = type === 'site' ? '' : `/organizations/${orgId}`;
  return path;
};
export default (orgId, type, intl, intlPrefix) => {
  const email = intl.formatMessage({ id: `${intlPrefix}.email` });
  const status = intl.formatMessage({ id: `${intlPrefix}.status` });
  const templateType = intl.formatMessage({ id: `${intlPrefix}.templateType` });
  const failedReason = intl.formatMessage({ id: `${intlPrefix}.failedReason` });
  const retryCount = intl.formatMessage({ id: `${intlPrefix}.send.count` });
  const creationDate = intl.formatMessage({ id: `${intlPrefix}.creationDate` });

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

  return {
    autoQuery: true,
    // autoCreate: datasetType !== 'query',
    selection: false,
    // dataKey: null,
    paging: true,
    fields: [
      { name: 'email', type: 'string', label: email },
      { name: 'statusMeaning', type: 'string', label: status },
      { name: 'messageName', type: 'string', label: templateType },
      { name: 'failedReason', type: 'string', label: failedReason },
      { name: 'retryCount', type: 'number', label: retryCount },
      { name: 'creationDate', type: 'string', label: creationDate },

    ],
    queryFields: [

      // receiveEmail 字段
      { name: 'receiveEmail', type: 'string', label: email },
      {
        name: 'status', type: 'string', label: status, textField: 'value', valueField: 'key', options: queryPredefined,
      },
      { name: 'messageName', type: 'string', label: templateType },
      { name: 'failedReason', type: 'string', label: failedReason },

    ],

    transport: {
      read: {
        url: '/hmsg/choerodon/v1/mails/records/emails',
        method: 'get',
      },
    },
  };
};
