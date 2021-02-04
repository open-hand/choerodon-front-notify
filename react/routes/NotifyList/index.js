import React from 'react';
import { StoreProvider } from './Store';
import Tab from './TableMessage';

export default props => (
  <StoreProvider {...props}>
    <Tab />
  </StoreProvider>
);
