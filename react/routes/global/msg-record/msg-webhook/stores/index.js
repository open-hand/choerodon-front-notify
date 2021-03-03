import React, { createContext, useMemo, useContext } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import MsgWebhookDataSet from './MsgWebhookDataSet';

const Store = createContext();
export function useWebhookRecordStore() {
  return useContext(Store);
}
export default Store;

export const StoreProvider = injectIntl(inject('AppState')(
  (props) => {
    const { AppState: { currentMenuType: { type, id, organizationId } }, intl, children } = props;
    const intlPrefix = 'msgrecord';
    const msgWebhookDataSet = useMemo(() => new DataSet(MsgWebhookDataSet()), []);
    const value = {
      ...props,
      intlPrefix,
      permissions: [
        'choerodon.code.site.manager.message-log.ps.webhook',
      ],
      msgWebhookDataSet,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
