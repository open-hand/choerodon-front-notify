export default function ({ setCurrentPageType, store }) {
  return {
    autoQuery: true,
    selection: false,
    paging: true,
    parentField: 'parentId',
    primaryKey: 'id',
    expandField: 'expand',
    idField: 'id',
    queryFields: [
      { name: 'id', type: 'string' },
    ],
    fields: [
      { name: 'parentId', type: 'string' },
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string', label: '节点名称' },
      { name: 'enabled', type: 'boolean', label: '是否启用' },
      { name: 'code', type: 'string' },
      { name: 'expand', type: 'boolean' },
    ],
    transport: {
      read: {
        url: 'hmsg/choerodon/v1/notices/send_settings/tree',
        method: 'get',
        transformResponse: (data) => {
          const newData = JSON.parse(data);
          return newData.map(d => {
            if (!d.name) {
              d.name = '';
            }
            return d;
          });
        },
      },
    },
    events: {
      load: ({ dataSet }) => {
        const expandsKeys = store.getExpandedKeys;
        if (expandsKeys && expandsKeys.length) {
          dataSet.forEach(record => {
            record.set('expand', expandsKeys.includes(String(record.get('id'))));
          });
        } else {
          dataSet.get(0).set('expand', true);
        }
      },
    },
  };
}
