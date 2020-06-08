import moment from 'moment';
import { DataSet } from 'choerodon-ui/pro';

export default (id, type, orgId, webhooksSettingUseStore) => {
  function handleLoadTime(startTime, endTime) {
    if (startTime && endTime) {
      const releaseDate = moment(endTime);
      const currentDate = moment(startTime);

      const diff = releaseDate.diff(currentDate);
      const diffDuration = moment.duration(diff);

      const diffYears = diffDuration.years();
      const diffMonths = diffDuration.months();
      const diffDays = diffDuration.days();
      const diffHours = diffDuration.hours();
      const diffMinutes = diffDuration.minutes();
      const diffSeconds = diffDuration.seconds();

      return `${diffYears ? `${diffYears}年` : ''}${diffMonths ? `${diffMonths}月` : ''}${diffDays ? `${diffDays}天` : ''}${diffHours ? `${diffHours}小时` : ''}${diffMinutes ? `${diffMinutes}分钟` : ''}${diffSeconds ? `${diffSeconds}秒` : ''}`;
    } else {
      return '正在计算时间...';
    }
  }

  const statusDataSet = new DataSet({
    selection: 'single',
    fields: [{
      name: 'text', type: 'string',
    }, {
      name: 'value', type: 'string',
    }],
  });

  const typeDataSet = new DataSet({
    selection: 'single',
    fields: [{
      name: 'text', type: 'string',
    }, {
      name: 'value', type: 'string',
    }],
  });

  return ({
    selection: false,
    transport: {
      read: ({ dataSet }) => ({
        url: dataSet.queryUrl,
        method: 'get',
        transformResponse(res) {
          const selectValues = webhooksSettingUseStore.getStatusList;
          const obj = {
            DingTalk: '钉钉',
            WeChat: '企业微信',
            Json: 'JSON',
          };
          const data = JSON.parse(res);
          if (data.content) {
            const newList = data.content.map(d => {
              if (d.creationDate) {
                d.sendTimeAround = `${handleLoadTime(d.creationDate, moment().format('YYYY-MM-DD HH:mm:ss'))}前`;
              } else {
                d.sendTimeAround = '无';
              }
              d.typeString = obj[d.webHookType];
              return d;
            });
            data.list = newList;
          }
          statusDataSet.loadData(Array.from(new Set(data.content.map(l => l.statusCode))).filter(s => s).map(a => ({
            value: a,
            text: selectValues.find(s => s.value === a) ? selectValues.find(s => s.value === a).meaning : '',
          })));
          typeDataSet.loadData(Array.from(new Set(data.content.map(d => d.webHookType))).map(l => ({
            value: l,
            text: obj[l],
          })));
          return data;
        },
      }),
    },
    fields: [{
      label: '触发事件',
      name: 'messageName',
      type: 'string',
    }, {
      label: 'Webhook地址',
      name: 'webHookAddress',
      type: 'string',
    }, {
      label: '状态',
      name: 'statusCode',
      type: 'string',
    }, {
      label: 'Webhook类型',
      name: 'typeString',
      type: 'string',
    }, {
      label: '发送时间',
      name: 'sendTimeAround',
      type: 'string',
    }],
    queryFields: [
      {
        label: '查询触发事件',
        name: 'messageName',
        type: 'string',
      },
      {
        label: '查询执行状态',
        name: 'statusCode',
        type: 'string',
        textField: 'text',
        valueField: 'value',
        options: statusDataSet,
      },
      {
        label: '查询webhook类型',
        name: 'type',
        type: 'string',
        textField: 'text',
        valueField: 'value',
        options: typeDataSet,
      },
    ],
  });
};
