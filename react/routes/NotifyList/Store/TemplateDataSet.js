import { DataSet } from 'choerodon-ui/pro/lib';
import omit from 'lodash/omit';

export default function (organizationId) {
  return {
    autoQuery: false,
    selection: false,
    autoQueryAfterSubmit: false,
    paging: true,

    fields: [
      { name: 'type', type: 'string', label: '类型' },
      { name: 'templateContent', type: 'string', required: true },
    ],
    transport: {
      read: {
        url: '/hmsg/choerodon/v1/notices/send_settings',
        method: 'get',
      },
      create: ({ data: [data] }) => {
        const newData = data;
        delete newData.isNew;
        return ({
          url: '/hmsg/choerodon/v1/notices/send_settings/template',
          method: 'post',
          data,
        });
      },
      update: ({ data: [data] }) => {
        const newData = data;
        delete newData.isNew;
        const postData = omit(data, ['messageCategoryCode', 'messageSubcategoryCode']);
        return ({
          url: '/hmsg/v1/message/templates',
          method: 'put',
          data: postData,
        });
      },
    },
  };
}
