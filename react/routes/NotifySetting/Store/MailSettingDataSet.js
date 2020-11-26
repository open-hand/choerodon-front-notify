export default (intl, intlPrefix) => {
  const account = intl.formatMessage({ id: `${intlPrefix}.account` });
  const password = intl.formatMessage({ id: `${intlPrefix}.password` });
  const sendName = intl.formatMessage({ id: `${intlPrefix}.sendName` });
  const protocal = intl.formatMessage({ id: `${intlPrefix}.protocal` });
  const host = intl.formatMessage({ id: `${intlPrefix}.host` });
  const ssl = intl.formatMessage({ id: `${intlPrefix}.ssl` });
  const port = intl.formatMessage({ id: `${intlPrefix}.port` });
  return {
    autoQuery: true,
    selection: false,
    paging: false,
    dataKey: null,
    fields: [
      { name: 'account', type: 'string', label: account, required: true },
      { name: 'password', type: 'string', label: password },
      { name: 'sendName', type: 'string', label: sendName, required: true },
      { name: 'protocol', type: 'string', label: protocal },
      { name: 'host', type: 'string', label: host, required: true },
      { name: 'ssl', type: 'boolean', label: ssl },
      { name: 'port', type: 'number', min: 1, max: 65535, label: port, required: true },
    ],
    transport: {
      read: {
        url: 'hmsg/choerodon/v1/notices/configs/email',
        method: 'get',
      },
      submit: ({ data }) => ({
        url: 'hmsg/choerodon/v1/notices/configs/email',
        method: 'put',
        data: data[0],
      }),
    },
  };
};
