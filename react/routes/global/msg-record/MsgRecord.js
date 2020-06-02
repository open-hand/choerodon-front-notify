import React from 'react';
import { PageWrap, PageTab } from '@choerodon/boot';
import { StoreProvider } from './stores';
import MsgEmail from './msg-email';
import MsgWebhook from './msg-webhook';

function MsgRecord(props) {
  return (
    <StoreProvider {...props}>
      <PageWrap noHeader={['choerodon.code.site.message-log-email', 'choerodon.code.site.message-log-webhook']} cache>
        <PageTab title="邮件日志" tabKey="choerodon.code.site.message-log-email" component={MsgEmail} alwaysShow />
        <PageTab title="webhook日志" tabKey="choerodon.code.site.message-log-webhook" component={MsgWebhook} alwaysShow />
      </PageWrap>
    </StoreProvider>

  );
}
export default MsgRecord;
