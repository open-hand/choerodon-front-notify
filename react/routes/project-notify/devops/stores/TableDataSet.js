/* eslint-disable no-param-reassign */

import JSONBig from 'json-bigint';

function formatData(data) {
  const newData = [];
  data.forEach((item) => {
    const res = { ...item };
    const {
      groupId, id, categoryCode, code,
    } = item;
    if (groupId) {
      res.key = `${groupId}-${code}`;
      // res.groupId = String(groupId);
    } else {
      res.key = categoryCode;
    }
    newData.push(res);
  });
  return newData;
}

function parentItemIsChecked({
  dataSet, record, name, flagName,
}) {
  const parentIsChecked = !dataSet.find((tableRecord) => record.get('key') === tableRecord.get('groupId') && !tableRecord.get(name) && tableRecord.get(flagName));
  const canCheck = !!dataSet.find((tableRecord) => record.get('key') === tableRecord.get('groupId') && tableRecord.get(flagName));
  record.init(flagName, canCheck);
  record.init(name, parentIsChecked && canCheck);
}

function handleLoad({ dataSet }) {
  dataSet.forEach((record) => {
    if (!record.get('groupId')) {
      parentItemIsChecked({
        dataSet, record, name: 'pmEnable', flagName: 'pmEnabledFlag',
      });
      parentItemIsChecked({
        dataSet, record, name: 'emailEnable', flagName: 'emailEnabledFlag',
      });
    }
  });
}

export default ({
  formatMessage, intlPrefix, projectId, userDs,
}) => ({
  autoQuery: true,
  selection: false,
  paging: false,
  autoQueryAfterSubmit: false,
  parentField: 'groupId',
  idField: 'key',
  primaryKey: 'key',
  transport: {
    read: {
      url: `/hmsg/choerodon/v1/projects/${projectId}/message_settings/devops`,
      method: 'get',
      transformResponse(response) {
        try {
          const data = JSONBig.parse(response);
          if (data && data.failed) {
            return data;
          }
          const { notifyEventGroupList, customMessageSettingList } = data;
          const res = notifyEventGroupList.concat(customMessageSettingList);
          return formatData(res);
        } catch (e) {
          return response;
        }
      },
    },
    submit: ({ data }) => {
      const res = data.filter(({ groupId }) => groupId);
      const newRes = [];
      res.forEach((item) => {
        if (!item.sendRoleList.includes('specifier')) {
          item.specifierIds = [];
          item.userList = [];
        } else {
          item.specifierIds = item.userList.map(({ id }) => id);
        }
        newRes.push(item);
      });
      return ({
        url: `/hmsg/choerodon/v1/projects/${projectId}/message_settings/devops/batch`,
        method: 'put',
        data: newRes,
      });
    },
  },
  fields: [
    { name: 'name', type: 'string', label: formatMessage({ id: `${intlPrefix}.type` }) },
    { name: 'pmEnable', type: 'boolean', label: formatMessage({ id: `${intlPrefix}.pmEnable` }) },
    { name: 'emailEnable', type: 'boolean', label: formatMessage({ id: `${intlPrefix}.emailEnable` }) },
    { name: 'notifyObject', type: 'string', label: formatMessage({ id: `${intlPrefix}.noticeObject` }) },
    { name: 'sendRoleList', multiple: true },
    {
      name: 'userList', type: 'object', textField: 'realName', valueField: 'id', options: userDs, multiple: true, label: formatMessage({ id: `${intlPrefix}.choose` }),
    },
  ],
  queryFields: [],
  events: {
    load: handleLoad,
  },
});
