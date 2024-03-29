import { DataSet } from 'choerodon-ui/pro/lib';

const getTypePath = (type, orgId, method = 'get') => {
  const path = type === 'site' ? '' : `/organizations/${orgId}`;
  return path;
};

export default (orgId, type, intl, intlPrefix) => {
  const email = intl.formatMessage({ id: `${intlPrefix}.email` });
  const status = intl.formatMessage({ id: `${intlPrefix}.status` });
  // const templateType = intl.formatMessage({ id: `${intlPrefix}.templateType` });
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
      { key: 'S', value: intl.formatMessage({ id: 'boot.success' }) },
      { key: 'F', value: intl.formatMessage({ id: 'boot.failed' }) },
      { key: 'P', value: intl.formatMessage({ id: `${intlPrefix}.ready` }) },
    ],
  });

  return {
    autoQuery: true,
    selection: false,
    paging: true,
    fields: [
      { name: 'messageName', type: 'string', label: email },
      { name: 'statusMeaning', type: 'string', label: status },
      { name: 'failedReason', type: 'string', label: failedReason },
      { name: 'retryCount', type: 'number', label: retryCount },
      { name: 'creationDate', type: 'string', label: creationDate },
    ],
    queryFields: [
      { name: 'messageName', type: 'string', label: email },
      {
        name: 'status', type: 'string', label: status, textField: 'value', valueField: 'key', options: queryPredefined,
      },
    ],
    transport: {
      read: {
        url: '/hmsg/choerodon/v1/mails/records/emails',
        method: 'get',
      },
    },
  };
};
