import React from 'react';
import { StoreProvider } from './Store';
import WebhooksSetting from './WebhooksSetting';

export default (props) => (
  <StoreProvider {...props}>
    <WebhooksSetting />
  </StoreProvider>
);
