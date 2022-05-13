// eslint-disable-next-line import/no-anonymous-default-export
export default ({
  formatClient, receiveStore, userId,
}) => {
  function parentItemIsChecked({ dataSet, record, name }) {
    const parentIsChecked = !dataSet.find((tableRecord) => record.get('sequenceId') === tableRecord.get('parentId') && !tableRecord.get(name) && !tableRecord.get(`${name}Disabled`));
    const disabled = !dataSet.find((tableRecord) => tableRecord.get('parentId') === record.get('sequenceId') && !tableRecord.get(`${name}Disabled`));
    const realValue = parentIsChecked && !disabled;
    record.init(name, realValue);
    record.init(`${name}Disabled`, disabled);
  }

  function isChecked(record, type, templateIdName, enabledName) {
    const newSendingType = type === 'pm' ? 'WEB' : 'EMAIL';
    const hasTemplateId = record.get(templateIdName) && record.get(enabledName);
    const isCheck = hasTemplateId && !receiveStore.getReceiveData.some(({ sendSettingId, sendingType }) => (
      sendSettingId === record.get('id') && sendingType === newSendingType
    ));
    record.init(type, isCheck);
    record.init(`${type}Disabled`, !hasTemplateId);
  }

  function handleLoad({ dataSet }) {
    dataSet.forEach((record) => {
      if (record.get('parentId')) {
        isChecked(record, 'pm', 'pmTemplateId', 'pmEnabledFlag');
        isChecked(record, 'email', 'emailTemplateId', 'emailEnabledFlag');
        isChecked(record, 'dt', 'dtTemplateId', 'dtEnabledFlag');
      }
    });
    dataSet.forEach((record) => {
      if (!record.get('parentId')) {
        parentItemIsChecked({ dataSet, record, name: 'pm' });
        parentItemIsChecked({ dataSet, record, name: 'email' });
        parentItemIsChecked({ dataSet, record, name: 'dt' });
      }
    });
  }

  return ({
    autoQuery: false,
    selection: false,
    paging: false,
    autoQueryAfterSubmit: false,
    parentField: 'parentId',
    idField: 'sequenceId',
    transport: {
      read: {
        url: '/hmsg/choerodon/v1/notices/send_settings/list/allow_config?source_type=SITE',
        method: 'get',
      },
      submit: ({ dataSet }) => {
        const res = [];
        const data = dataSet.toData();
        data.forEach(({
          pm, email, id, parentId, pmDisabled, emailDisabled,dt, dtDisabled,
        }) => {
          if (!parentId) return;
          if (!pm && !pmDisabled) {
            res.push({
              sendingType: 'WEB',
              disable: true,
              sourceType: 'site',
              sendSettingId: id,
              userId,
            });
          }
          if (!email && !emailDisabled) {
            res.push({
              sendingType: 'EMAIL',
              disable: true,
              sourceType: 'site',
              sendSettingId: id,
              userId,
            });
          }
          if (!dt && !dtDisabled) {
            res.push({
              sendingType: 'DT',
              disable: true,
              sourceType: 'site',
              sendSettingId: id,
              userId,
            });
          }

        });

        return ({
          url: '/hmsg/choerodon/v1/notices/receive_setting/all?source_type=SITE',
          method: 'put',
          data: res,
        });
      },
    },
    fields: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string', label: formatClient({ id: 'projectNotice' }) },
      { name: 'pm', type: 'boolean', label: formatClient({ id: 'pm' }) },
      { name: 'email', type: 'boolean', label: formatClient({ id: 'email' }) },
      { name: 'dt', type: 'boolean', label: '钉钉' },
    ],
    queryFields: [],
    events: {
      load: handleLoad,
    },
  });
};
