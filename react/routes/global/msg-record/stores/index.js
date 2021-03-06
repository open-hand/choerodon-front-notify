import React, { createContext, useContext } from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';

const Store = createContext();
export function useStore() {
  return useContext(Store);
}
export default Store;

export const StoreProvider = injectIntl(inject('AppState')(
  (props) => {
    const { AppState: { currentMenuType: { type, id, organizationId } }, intl, children } = props;
    const intlPrefix = 'msgrecord';
    const value = {
      ...props,
      intlPrefix,
      ENABLED_GREEN: 'rgba(0, 191, 165, 1)',
      DISABLED_GRAY: 'rgba(0, 0, 0, 0.2)',
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
