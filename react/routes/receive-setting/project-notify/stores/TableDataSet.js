export default ({ formatMessage, intlPrefix, receiveStore, userId }) => {
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
      }
    });
    dataSet.forEach((record) => {
      if (record.get('treeType') === 'project') {
        parentItemIsChecked({ dataSet, record, name: 'pm' });
        parentItemIsChecked({ dataSet, record, name: 'email' });
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
            const data = JSON.parse(response);
            if (data && data.failed) {
              return data;
            } else {
              receiveStore.setAllowConfigData(data);
              return receiveStore.formatData();
            }
          } catch (e) {
            return response;
          }
        },
      },
      submit: ({ dataSet }) => {
        const res = [];
        const data = dataSet.toData();
        data.forEach(({ pm, email, id, treeType, sourceId, pmDisabled, emailDisabled }) => {
          if (treeType === 'item') {
            const projectId = sourceId.split('-')[0];
            if (!pm && !pmDisabled) {
              res.push({
                sendingType: 'pm',
                disable: true,
                sendSettingId: id,
                sourceType: 'project',
                sourceId: projectId,
                userId,
              });
            }
            if (!email && !emailDisabled) {
              res.push({
                sendingType: 'email',
                disable: true,
                sourceType: 'project',
                sendSettingId: id,
                sourceId: projectId,
                userId,
              });
            }
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
      { name: 'parentId', type: 'number' },
      { name: 'sequenceId', type: 'number' },
      { name: 'name', type: 'string', label: formatMessage({ id: 'receive.type' }) },
      { name: 'pm', type: 'boolean', label: formatMessage({ id: 'receive.type.pm' }) },
      { name: 'email', type: 'boolean', label: formatMessage({ id: 'receive.type.email' }) },
    ],
    queryFields: [],
    events: {
      load: handleLoad,
      beforeLoad: () => {
        receiveStore.setSpinning(true);
      },
    },
  });
};
