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
    { name: 'webhookPath', type: 'string', label: 'Webhook地址', required: true },
    { name: 'type', type: 'string', label: 'Webhook类型' },
    { name: 'enableFlag', type: 'boolean', label: '状态', required: true },
  ],
  transport: {
    read: {
      url: `notify/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks`,
      method: 'get',
      params: {
        sourceLevel: type,
      },
      transformResponse(res) {
        let newRes;
        try {
          newRes = JSON.parse(res);
        } catch (e) {
          newRes = res;
        }
        newRes.list = newRes.list.map((l) => {
          l.isScrolling = false;
          return l;
        });
        return newRes;
      },
    },
    destroy: ({ data: [record, ...etc] }) => ({
      url: `notify/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks/${record.id}`,
      method: 'delete',
      data: undefined,
    }),
  },
});
