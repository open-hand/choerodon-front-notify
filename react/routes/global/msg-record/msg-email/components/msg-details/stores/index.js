import React, { createContext, useMemo, useContext } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import MsgDetailsDataSet from './MsgDetailsDataSet';
import MsgEmailDataSet from './MsgEmailDataSet';
import useStore from './useStore';

const Store = createContext();
export function useMsgDetailStore() {
  return useContext(Store);
}
export default Store;

export const StoreProvider = injectIntl(inject('AppState')(
  (props) => {
    const {
      AppState: { currentMenuType: { organizationId } }, children, msgId, isOrgLev,
    } = props;

    const mainStore = useStore();
    const msgDetailDs = useMemo(() => new DataSet(MsgDetailsDataSet({ msgId, isOrgLev, organizationId })), [msgId]);

    const msgEmailDs = useMemo(() => new DataSet(MsgEmailDataSet({
      organizationId, msgId, mainStore, isOrgLev,
    })), [organizationId, msgId]);
    const value = {
      ...props,
      msgDetailDs,
      msgEmailDs,
      mainStore,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
