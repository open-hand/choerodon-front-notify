/* eslint-disable import/no-anonymous-default-export */
export default (({ msgId }) => ({
  autoQuery: true,
  dataKey: null,
  transport: {
    read: ({ data }) => (msgId ? {
      url: `hmsg/v1/messages/${msgId}/contents`,
      method: 'get',
    } : {}),
  },
}));
