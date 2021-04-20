import React from 'react';
import { asyncRouter } from '@choerodon/boot';
import { StoreProvider } from './stores';

const MsgEmail = asyncRouter(() => (import('./Content')));

const Index = (props) => (
  <StoreProvider {...props}>
    <MsgEmail />
  </StoreProvider>
);

export default Index;
