import React from 'react';
import { StoreProvider } from './Store';
import NotifyContent from './NotifyContent';

export default props => (
  <StoreProvider {...props}>
    <NotifyContent />
  </StoreProvider>
);
