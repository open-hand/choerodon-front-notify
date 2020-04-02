import { DataSet } from 'choerodon-ui/pro';
import { axios } from '@choerodon/boot';

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

/**
 *
 * @param type(create/edit)
 * @param id(create: projectId / edit: webhookId)
 * @returns DataSet
 */
export default function (type, id, children, orgId, orgType) {
  const validateWebhooksPath = async (value) => {
    try {
      const res = await axios.get(`notify/v1/${orgType === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks/check_path`, {
        params: {
          id,
          path: value,
        },
      });
      if (!res) {
        return '路径重复';
      }
      return true;
    } catch (e) {
      return '校验失败';
    }
  };

  return {
    autoQuery: false,
    queryUrl: '',
    selection: false,
    paging: false,
    dataKey: false,
    data: [{
      type: 'DingTalk',
    }],
    fields: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string', label: 'Webhooks名称', required: true },
      { name: 'type', type: 'string', label: 'Webhooks类型', options: typeOptionDataSet, valueField: 'value', textField: 'name', required: true },
      { name: 'secret',
        type: 'string',
        dynamicProps: ({ record, name }) => ({
          label: record.get('type') === 'DingTalk' ? '钉钉加签密钥' : '密钥',
        }),
      },
      { name: 'webhookPath', type: 'string', label: 'Webhooks地址', validator: validateWebhooksPath, required: true },
      { name: 'id', type: 'number' },
      { name: 'objectVersionNumber', type: 'number' },
      { name: 'triggerEventSelection', ignore: 'always' },
    ],
    transport: {
      read: ({ dataSet }) => ({
        url: dataSet.queryUrl,
        method: 'get',
        transformResponse(data) {
          const { sendSettingIdList, triggerEventSelection } = JSON.parse(data);
          const { sendSettingCategorySelection, sendSettingSelection } = triggerEventSelection;
          return {
            ...JSON.parse(data),
            triggerEventSelection: [...sendSettingCategorySelection, ...sendSettingSelection],
          };
        },
      }),
      update: ({ data }) => ({
        url: `notify/v1/projects/${id}/web_hooks/${data[0].id}`,
        method: 'put',
        data: {
          ...data[0],
          sendSettingIdList: children.toJSONData(true).filter(item => !!item.categoryCode).map(item => item.id),
        },
      }),
    },
    events: {
      // fieldChange: ({ dataSet, record, name, propsName, value, oldValue }) => {
      //
      // },
      // load: ({ dataSet }) => {
      //   debugger;
      //   let categoryCodesList = [];
      //   if (children) {
      //     children.forEach((item) => {
      //       if (item.isSelected) {
      //         item.isSelected = false;
      //       }
      //       if (dataSet.current.get('sendSettingIdList').find(selectId => selectId === item.get('id'))) {
      //         // if (item.get('categoryCode')) {
      //         //   children.find(l => l.get('code') === item.get('categoryCode')).isSelected = true;
      //         // }
      //         if (item.get('categoryCode')) {
      //           categoryCodesList = [...categoryCodesList, item.get('categoryCode')];
      //         }
      //         item.isSelected = true;
      //       }
      //     });
      //   }
      //   if (categoryCodesList.length > 0) {
      //     categoryCodesList.forEach(c => {
      //       children.find(l => l.get('code') === c).isSelected = true;
      //     });
      //   }
      // },
    },
  };
}
