import React from 'react';
import { asyncRouter } from '@choerodon/boot';
import { StoreProvider } from './stores';

const MsgEmail = asyncRouter(() => (import('./MsgEmail')));

const Index = (props) => (
  <StoreProvider {...props}>
    <MsgEmail />
  </StoreProvider>
);

export default Index;
