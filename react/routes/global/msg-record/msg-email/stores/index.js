import React, { createContext, useMemo, useContext } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import MsgRecordDataSet from './MsgRecordDataSet';

const Store = createContext();
export function useMsgRecordStore() {
  return useContext(Store);
}
export default Store;

export const StoreProvider = injectIntl(inject('AppState')(
  (props) => {
    const { AppState: { currentMenuType: { type, id, organizationId } }, intl, children } = props;
    const intlPrefix = 'msgrecord';
    const msgRecordDataSet = useMemo(() => new DataSet(MsgRecordDataSet(organizationId, type, intl, intlPrefix)), []);

    const value = {
      ...props,
      intlPrefix,
      permissions: [
        'choerodon.code.site.manager.message-log.ps.email',
      ],
      msgRecordDataSet,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
