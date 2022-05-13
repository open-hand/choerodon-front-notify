import JSONBig from 'json-bigint';

// eslint-disable-next-line import/no-anonymous-default-export
export default ({
  formatClient, receiveStore, userId,
}) => {
  function parentItemIsChecked({ dataSet, record, name }) {
    const parentIsChecked = !dataSet.find((tableRecord) => record.get('key') === tableRecord.get('sourceId') && !tableRecord.get(name) && !tableRecord.get(`${name}Disabled`));
    const disabled = !dataSet.find((tableRecord) => tableRecord.get('sourceId') === record.get('key') && !tableRecord.get(`${name}Disabled`));
    const realValue = parentIsChecked && !disabled;
    record.init(name, realValue);
    record.init(`${name}Disabled`, disabled);
  }

  function handleLoad({ dataSet }) {
    dataSet.forEach((record) => {
      if (record.get('treeType') === 'group') {
        parentItemIsChecked({ dataSet, record, name: 'pm' });
        parentItemIsChecked({ dataSet, record, name: 'email' });
        parentItemIsChecked({ dataSet, record, name: 'dt' });
      }
    });
    dataSet.forEach((record) => {
      if (record.get('treeType') === 'project') {
        parentItemIsChecked({ dataSet, record, name: 'pm' });
        parentItemIsChecked({ dataSet, record, name: 'email' });
        parentItemIsChecked({ dataSet, record, name: 'dt' });
      }
    });
    receiveStore.setSpinning(false);
  }

  return ({
    autoQuery: false,
    selection: false,
    paging: true,
    autoQueryAfterSubmit: false,
    parentField: 'sourceId',
    idField: 'key',
    primaryKey: 'key',
    transport: {
      read: {
        url: '/hmsg/choerodon/v1/notices/send_settings/list/allow_config?source_type=PROJECT',
        method: 'get',
        transformResponse(response) {
          try {
            const data = JSONBig.parse(response);
            if (data && data.failed) {
              return data;
            }
            receiveStore.setAllowConfigData(data);
            return receiveStore.formatData();
          } catch (e) {
            return response;
          }
        },
      },
      submit: ({ dataSet }) => {
        const res = [];
        const keys = [];
        const data = dataSet.toData();
        data.forEach(({
          pm, email, id, treeType, sourceId, pmDisabled, emailDisabled,dt, dtDisabled,
        }) => {
          if (treeType === 'item') {
            const projectId = sourceId.split('-')[0];
            keys.push(`${projectId}**${id}`);
            if (!pm && !pmDisabled) {
              res.push({
                sendingType: 'WEB',
                disable: true,
                sendSettingId: id,
                sourceType: 'project',
                sourceId: projectId,
                userId,
              });
            }
            if (!email && !emailDisabled) {
              res.push({
                sendingType: 'EMAIL',
                disable: true,
                sourceType: 'project',
                sendSettingId: id,
                sourceId: projectId,
                userId,
              });
            }
            if (!dt && !dtDisabled) {
              res.push({
                sendingType: 'DT',
                disable: true,
                sourceType: 'project',
                sendSettingId: id,
                sourceId: projectId,
                userId,
              });
            }

          }
        });
        const receiveData = [...receiveStore.getReceiveData];
        receiveData.forEach((item) => {
          const { sendSettingId, sourceId } = item;
          const key = `${sourceId}**${sendSettingId}`;
          if (!keys.includes(key)) {
            res.push(item);
          }
        });

        return ({
          url: '/hmsg/choerodon/v1/notices/receive_setting/all?source_type=PROJECT',
          method: 'put',
          data: res,
        });
      },
    },
    fields: [
      { name: 'parentId', type: 'string' },
      { name: 'sequenceId', type: 'string' },
      { name: 'name', type: 'string', label: formatClient({ id: 'projectNotice' }) },
      { name: 'pm', type: 'boolean', label: formatClient({ id: 'platformNotice' }) },
      { name: 'email', type: 'boolean', label: formatClient({ id: 'email' }) },
      { name: 'dt', type: 'boolean', label: '钉钉' },
      { name: 'organizationName', type: 'string', label: formatClient({ id: 'orgName' }) },
    ],
    queryFields: [],
    events: {
      load: handleLoad,
      beforeLoad: () => {
        receiveStore.setSpinning(true);
      },
      query: async ({ params }) => {
        const { params: tableParams } = params || {};
        await receiveStore.loadReceiveData(userId, tableParams);
        return true;
      },
    },
  });
};
