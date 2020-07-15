import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import TableDataSet from './TableDataSet';
import useStore from './useStore';

const Store = createContext();

export function useProjectNotifyStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(observer((props) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { getUserInfo: { id } },
  } = props;
  const intlPrefix = 'receive.setting.project';

  const receiveStore = useStore();
  const tableDs = useMemo(() => new DataSet(TableDataSet({ formatMessage, intlPrefix, receiveStore, userId: id })), []);

  useEffect(() => {
    const queryData = tableDs.queryDataSet.toData();
    if (queryData && queryData.length) {
      const { params } = queryData[0] || {};
      receiveStore.loadReceiveData(id, params);
    }
  }, [tableDs.queryDataSet.toData()]);

  const value = {
    ...props,
    intlPrefix,
    prefixCls: 'receive-setting-project',
    permissions: [],
    tableDs,
    receiveStore,
  };

  async function loadInitData() {
    await receiveStore.loadReceiveData(id);
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
