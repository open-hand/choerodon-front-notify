export default () => ({
  autoQuery: true,
  selection: 'single',
  paging: false,
  transport: {
    read: {
      url: 'hpfm/v1/lovs/value?lovCode=HMSG.SMS_SERVER_TYPE',
      method: 'get',
    },
  },
});
