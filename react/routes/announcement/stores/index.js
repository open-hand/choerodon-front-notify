import React, { createContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import AnnouncementDataSet from './AnnouncementDataSet';

const Store = createContext();

export default Store;

export const StoreProvider = injectIntl(inject('AppState')(
  (props) => {
    const { AppState: { currentMenuType: { type, id } }, intl, children } = props;
    const intlPrefix = 'c7n.announcement';
    const announcementDataSet = useMemo(() => new DataSet(AnnouncementDataSet(intl, intlPrefix)));
    const value = {
      ...props,
      intlPrefix,
      announcementDataSet,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
