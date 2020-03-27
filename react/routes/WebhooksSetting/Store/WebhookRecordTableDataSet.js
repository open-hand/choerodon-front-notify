import moment from 'moment';

export default (id, type, orgId) => {
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

      return `${diffYears ? `${diffYears}年` : ''}${diffMonths ? `${diffMonths}月` : ''}${diffDays ? `${diffDays}日` : ''}${diffHours ? `${diffHours}小时` : ''}${diffMinutes ? `${diffMinutes}分钟` : ''}${diffSeconds ? `${diffSeconds}秒` : ''}`;
    } else {
      return '正在计算时间...';
    }
  }
  return ({
    selection: false,
    transport: {
      read: ({ dataSet }) => ({
        url: dataSet.queryUrl,
        method: 'get',
        transformResponse(res) {
          const obj = {
            DingTalk: '钉钉',
            WeChat: '企业微信',
            Json: 'JSON',
          };
          const data = JSON.parse(res);
          if (res.list) {
            const newList = data.list.map(d => {
              if (d.sendTime && d.endTime) {
                d.sendTime = handleLoadTime(d.sendTime, d.endTime);
              } else {
                d.sendTime = '无';
              }
              d.type = obj[d.type];
              return d;
            });
            data.list = newList;
          }
          return data;
        },
      }),
    },
    fields: [{
      label: '触发事件',
      name: 'name',
      type: 'string',
    }, {
      label: 'Webhook地址',
      name: 'webhookPath',
      type: 'string',
    }, {
      label: '状态',
      name: 'status',
      type: 'string',
    }, {
      label: 'Webhook类型',
      name: 'type',
      type: 'string',
    }, {
      label: '发送时间',
      name: 'sendTime',
      type: 'string',
    }],
    queryFields: [
      {
        label: '查询触发事件',
        name: 'name',
        type: 'string',
      },
      {
        label: '查询执行状态',
        name: 'status',
        type: 'string',
      },
      {
        label: '查询webhook类型',
        name: 'type',
        type: 'string',
      },
    ],
  });
};
