import { DataSet } from 'choerodon-ui/pro/lib';

export default function (organizationId) {
  return {
    autoQuery: false,
    selection: false,
    autoQueryAfterSubmit: false,
    paging: true,

    fields: [
      { name: 'type', type: 'string', label: '类型' },
      { name: 'templateContent', type: 'string' },
    ],
    transport: {
      read: {
        url: '/hmsg/choerodon/v1/notices/send_settings',
        method: 'get',
      },
      create: ({ data: [data] }) => ({
        url: '/hmsg/choerodon/v1/notices/send_settings/template',
        method: 'post',
        data,
      }),
      update: ({ data: [data] }) => ({
        url: `/hmsg/v1/${organizationId}/message/templates`,
        method: 'put',
        data,
      }),
    },
  };
}
