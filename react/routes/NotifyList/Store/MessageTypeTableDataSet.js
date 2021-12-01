import { DataSet } from 'choerodon-ui/pro/lib';

export default function ({
  optionDs, intlPrefix, format, formatCommon,
}) {
  const queryEnabled = new DataSet({
    autoQuery: true,
    paging: false,
    fields: [
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    data: [
      { key: true, value: formatCommon({ id: 'enable' }) },
      { key: false, value: formatCommon({ id: 'stop' }) },
    ],
  });
  const queryAllowConfig = new DataSet({
    autoQuery: true,
    paging: false,
    fields: [
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    data: [
      { key: true, value: formatCommon({ id: 'allow' }) },
      { key: false, value: formatCommon({ id: 'ban' }) },
    ],
  });
  return {
    autoQuery: true,
    selection: false,
    paging: true,
    fields: [{
      name: 'messageName',
      type: 'string',
      label: format({ id: 'messageType' }),
    }, {
      name: 'description',
      type: 'string',
      label: format({ id: 'instructions' }),
    }, {
      name: 'enabled',
      type: 'boolean',
      label: formatCommon({ id: 'states' }),
    }, {
      name: 'receiveConfigFlag',
      type: 'number',
      label: format({ id: 'receiveConfigFlag' }),
    }],
    queryFields: [{
      name: 'messageName',
      type: 'string',
      label: format({ id: 'messageType' }),
    }, {
      name: 'introduce',
      type: 'string',
      label: format({ id: 'instructions' }),
    }, {
      name: 'enabled',
      type: 'string',
      label: formatCommon({ id: 'states' }),
      textField: 'value',
      valueField: 'key',
      options: queryEnabled,
    }, {
      name: 'receiveConfigFlag',
      type: 'string',
      label: format({ id: 'receiveConfigFlag' }),
      textField: 'value',
      valueField: 'key',
      options: queryAllowConfig,
    }, {
      name: 'secondCode',
      type: 'string',
    }, {
      name: 'firstCode',
      type: 'string',
    }],
    transport: {
      read: (props) => ({
        url: '/hmsg/choerodon/v1/notices/send_settings',
        method: 'get',
        transformResponse(data) {
          return ({
            list: JSON.parse(data).content,
            ...JSON.parse(data),
          });
        },
      }),
    },
  };
}
