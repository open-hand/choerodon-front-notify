import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import TableDataSet from './TableDataSet';
import useStore from './useStore';
import { useReceiveSettingStore } from '../../stores/index';

const Store = createContext();

export function useSiteNotifyStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(observer((props) => {
  const {
    children,
    AppState: { getUserInfo: { id } },
  } = props;
  const { formatClient, intlPrefix } = useReceiveSettingStore();

  const receiveStore = useStore();
  const tableDs = useMemo(() => new DataSet(TableDataSet({
    formatClient, receiveStore, userId: id,
  })), []);
  const value = {
    ...props,
    intlPrefix,
    prefixCls: 'receive-setting-site',
    permissions: [],
    tableDs,
    receiveStore,
  };

  async function loadInitData() {
    await receiveStore.loadReceiveData();
    tableDs.query();
  }

  useEffect(() => {
    loadInitData();
  }, []);

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
