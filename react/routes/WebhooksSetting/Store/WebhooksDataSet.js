/**
 *
 * @param id
 * @return DataSet
 */
export default (id, type, orgId) => ({
  autoQuery: true,
  selection: false,
  fields: [
    { name: 'name', type: 'string', label: '触发事件', required: true },
    { name: 'webhookAddress', type: 'string', label: 'Webhook地址', required: true },
    { name: 'serverType', type: 'string', label: 'Webhook类型' },
    { name: 'enableFlag', type: 'boolean', label: '状态', required: true },
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
          l.name = l.templateServers.map(t => t.messageName).join(',');
          return l;
        });
        return newRes;
      },
    },
    destroy: ({ data: [record, ...etc] }) => ({
      url: `hmsg/choerodon/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks/${record.id}`,
      method: 'delete',
      data: undefined,
    }),
  },
});
