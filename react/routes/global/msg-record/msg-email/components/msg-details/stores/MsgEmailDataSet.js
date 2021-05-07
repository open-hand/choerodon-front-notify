import JSONbig from 'json-bigint';

/* eslint-disable import/no-anonymous-default-export */
export default (({ organizationId, msgId, mainStore }) => ({
  autoQuery: true,
  paging: true,
  pageSize: 10,
  transport: {
    read: ({ dataSet }) => (msgId ? {
      url: `/hmsg/v1/messages/${msgId}/receivers?tenantId=${organizationId}`,
      method: 'get',
      transformResponse: (response) => {
        try {
          const data = JSONbig.parse(response);
          if (data && data.failed) {
            return data;
          }
          let newData = [...data.content];
          if (data.number > 0 && dataSet) {
            newData = [...dataSet.toData(), ...data.content];
          }
          if (dataSet) {
            // eslint-disable-next-line no-param-reassign
            dataSet.pageSize *= (data.number + 1);
          }
          mainStore.setListHasMore(data.totalElements > 0 && (data.number + 1) < data.totalPages);
          return newData;
        } catch (e) {
          return response;
        }
      },
    } : {}),
  },
}));
