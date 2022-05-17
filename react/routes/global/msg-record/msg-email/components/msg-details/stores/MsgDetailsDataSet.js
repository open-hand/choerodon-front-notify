/* eslint-disable import/no-anonymous-default-export */
export default (({ msgId, isOrgLev, organizationId }) => ({
  autoQuery: true,
  dataKey: null,
  transport: {
    read: ({ data }) => (msgId ? {
      url: isOrgLev ? `hmsg/v1/${organizationId}/messages/${msgId}/contents` : `hmsg/v1/messages/${msgId}/contents`,
      method: 'get',
    } : {}),
  },
}));
