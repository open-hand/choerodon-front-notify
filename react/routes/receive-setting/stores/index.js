import React, { createContext, useContext } from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { Choerodon } from '@choerodon/boot';
import {
  useFormatMessage, useFormatCommon,
} from '@choerodon/master';

const Store = createContext();

export function useReceiveSettingStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(observer((props) => {
  const {
    children,
    intl: { formatMessage },
  } = props;

  const intlPrefix = 'c7ncd.receive-setting';
  const formatClient = useFormatMessage(intlPrefix);
  const formatCommon = useFormatCommon();

  const value = {
    ...props,
    intlPrefix,
    prefixCls: 'user-receive-setting',
    promptMsg: formatMessage({ id: 'global.menusetting.prompt.inform.title' }) + Choerodon.STRING_DEVIDER + formatMessage({ id: 'global.menusetting.prompt.inform.message' }),
    formatClient,
    formatCommon,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
