/**
 *
 * @param id
 * @return DataSet
 */
/*eslint-disable*/

import { DataSet } from 'choerodon-ui/pro';

const typeOptionDataSet = new DataSet({
  fields: [
    { name: 'name', type: 'string' },
    { name: 'value', type: 'string' },
  ],
  data: [
    { name: '钉钉', value: 'DingTalk' },
    { name: '企业微信', value: 'WeChat' },
    { name: 'JSON', value: 'Json' },
  ],
});

export default (id, type, orgId) => ({
  autoQuery: true,
  selection: false,
  fields: [
    {
      name: 'name', type: 'string', label: '触发事件', required: true,
    },
    {
      name: 'webhookAddress', type: 'string', label: 'Webhook地址', required: true,
    },
    { name: 'serverType', type: 'string', label: 'Webhook类型' },
    {
      name: 'enabledFlag', type: 'number', label: '状态', required: true,
    },
  ],
  queryFields: [
    {
      label: '查询触发事件',
      name: 'messageName',
      type: 'string',
    },
    {
      label: '查询webhook类型',
      name: 'type',
      type: 'string',
      textField: 'name',
      valueField: 'value',
      options: typeOptionDataSet,
    },
  ],
  transport: {
    read: {
      url: `hmsg/choerodon/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks`,
      method: 'get',
      transformResponse(res) {
        let newRes;
        try {
          newRes = JSON.parse(res);
        } catch (e) {
          newRes = res;
        }
        newRes.list = newRes.content.map((l) => {
          l.isScrolling = false;
          l.name = l.templateServers.map((t) => t.messageName).join(',');
          return l;
        });
        return newRes;
      },
    },
    destroy: ({ data: [record, ...etc] }) => ({
      url: `hmsg/choerodon/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks/${record.serverId}`,
      method: 'delete',
      data: undefined,
    }),
  },
});
