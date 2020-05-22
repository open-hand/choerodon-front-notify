export default (intl, intlPrefix, serverTypeDs) => {
  const signature = intl.formatMessage({ id: `${intlPrefix}.signature` });
  const accessKeySecret = intl.formatMessage({ id: `${intlPrefix}.accessKeySecret` });
  const accessKey = intl.formatMessage({ id: `${intlPrefix}.accessKey` });
  const endPoint = intl.formatMessage({ id: `${intlPrefix}.endPoint` });
  const code = intl.formatMessage({ id: `${intlPrefix}.code` });
  const serviceType = intl.formatMessage({ id: `${intlPrefix}.serviceType` });
  return {
    autoQuery: true,
    selection: false,
    paging: false,
    dataKey: false,
    fields: [
      { name: 'id', type: 'string' },
      { name: 'signName', type: 'string', label: signature, required: true },
      { name: 'accessKey', type: 'string', label: accessKey, required: true },
      { name: 'accessKeySecret', type: 'string', label: accessKeySecret },
      { name: 'endPoint', type: 'string', label: endPoint },
      { name: 'serverCode', type: 'string', label: code, required: true },
      { name: 'serverTypeCode', type: 'string', label: serviceType, required: true, textField: 'name', valueField: 'code', options: serverTypeDs },
    ],
    transport: {
      read: {
        url: '/hmsg/choerodon/v1/notices/configs/sms?organization_id=0',
        method: 'get',
      },
      submit: ({ data }) => ({
        url: `/hmsg/choerodon/v1/sms/config/${data[0].id || 0}`,
        method: 'put',
        data: data[0],
      }),
    },
  };
};
