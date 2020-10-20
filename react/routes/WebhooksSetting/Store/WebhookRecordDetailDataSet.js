import moment from 'moment';

export default () => {
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
    }
    return '正在计算时间...';
  }

  return ({
    transport: {
      read: ({ dataSet }) => ({
        url: dataSet.queryUrl,
        method: 'get',
        transformResponse(res) {
          const data = JSON.parse(res);
          if (data.sendTime && data.endTime) {
            data.timeConsuming = handleLoadTime(data.sendTime, data.endTime) || '0.00秒';
          } else {
            data.timeConsuming = '无';
          }
          return [data];
        },
      }),
    },
    fields: [{
      name: 'messageName',
      type: 'string',
      label: '触发事件',
    }, {
      name: 'creationDate',
      type: 'string',
      label: '发送时间',
    }, {
      name: 'statusMeaning',
      type: 'string',
      label: '执行状态',
    }, {
      name: 'webHookAddress',
      type: 'string',
      label: 'Webhook地址',
    }],
  });
};
