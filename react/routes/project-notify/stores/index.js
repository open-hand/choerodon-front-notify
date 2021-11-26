import React, { createContext, useContext, useMemo } from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { Choerodon, useFormatMessage } from '@choerodon/master';
import { DataSet } from 'choerodon-ui/pro';
import UserOptionsDataSet from './UserOptionsDataSet';

const Store = createContext();

export function useProjectNotifyStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(observer((props) => {
  const {
    children,
    AppState: { currentMenuType: { projectId } },
    intl: { formatMessage },
  } = props;

  const userDs = useMemo(() => new DataSet(UserOptionsDataSet(projectId)), [projectId]);

  const intlPrefix = 'c7ncd.project.notify';

  const formatProjectNotify = useFormatMessage(intlPrefix);

  const value = {
    ...props,
    prefixCls: 'project-notify',
    permissions: [],
    formatProjectNotify,
    promptMsg: formatMessage({ id: 'global.menusetting.prompt.inform.title' }) + Choerodon.STRING_DEVIDER + formatMessage({ id: 'global.menusetting.prompt.inform.message' }),
    userDs,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
