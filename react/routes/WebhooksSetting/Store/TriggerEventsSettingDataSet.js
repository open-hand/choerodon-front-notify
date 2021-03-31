/**
 *
 * @param id
 * @return DataSet
 */
export default (type, id, orgType, orgId, useStore) => ({
  autoQuery: false,
  parentField: 'categoryCode',
  idField: 'code',
  dataToJSON: 'selected',
  queryFields: [
    { name: 'name', type: 'string', label: '类型/触发事件' },
    { name: 'description', type: 'string', label: '描述' },
  ],
  fields: [
    { name: 'name', type: 'string', label: '类型/触发事件' },
    { name: 'description', type: 'string', label: '描述' },
    { name: 'categoryCode', type: 'string', parentFieldName: 'code' },
    { name: 'code', type: 'string', unique: true },
    { name: 'objectVersionNumber', type: 'number' },
    // { name: 'enabled', type: 'boolean', label: '状态', required: true },
  ],
  transport: {
    read: ({ data, params }) => ({
      url: `hmsg/choerodon/v1/${orgType === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks/send_settings`,
      method: 'get',
      transformResponse(JSONData) {
        const { categories, sendSettings } = JSON.parse(JSONData);
        const arrCategories = [];
        Object.keys(categories).forEach((k) => {
          arrCategories.push({
            code: k,
            name: categories[k],
          });
        });
        const sendSettings2 = sendSettings.map((s) => {
          // eslint-disable-next-line no-param-reassign
          s.categoryCode = s.subcategoryCode;
          // eslint-disable-next-line no-param-reassign
          s.name = s.messageName;
          // eslint-disable-next-line no-param-reassign
          s.id = s.tempServerId;
          return s;
        });
        const list = (arrCategories || []).map((item) => ({ ...item, description: null }));
        return [...list, ...(sendSettings2 || [])];
      },
      params: {
        ...params,
        type: data.type,
        name: data.name,
        description: data.description,
      },
    }),
  },
  events: {
    selectAll: () => {
      useStore.setChangeWebhookSetting();
    },
    unSelectAll: () => {
      useStore.setChangeWebhookSetting();
    },
    select: ({ dataSet, record }) => {
      useStore.setChangeWebhookSetting();
      if (record.parent) {
        // eslint-disable-next-line no-param-reassign
        record.parent.isSelected = true;
      } else {
        record.children.forEach((item) => {
          // eslint-disable-next-line no-param-reassign
          item.isSelected = true;
        });
      }
    },
    unSelect: ({ dataSet, record }) => {
      useStore.setChangeWebhookSetting();
      if (record.parent && record.parent.children.filter((item) => item.isSelected).length === 0) {
        // eslint-disable-next-line no-param-reassign
        record.parent.isSelected = false;
      }
      if (!record.parent) {
        record.children.forEach((item) => {
          // eslint-disable-next-line no-param-reassign
          item.isSelected = false;
        });
      }
    },
  },
});
