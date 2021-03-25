import React from 'react';
import { PageWrap, PageTab } from '@choerodon/boot';
import { StoreProvider } from './stores';
import MsgEmail from './msg-email';
import MsgWebhook from './msg-webhook';

import './index.less';

function MsgRecord(props) {
  return (
    <StoreProvider {...props}>
      <PageWrap noHeader={['choerodon.code.site.manager.message-log.ps.email', 'choerodon.code.site.manager.message-log.ps.webhook']} cache>
        <PageTab title="邮件日志" tabKey="choerodon.code.site.manager.message-log.ps.email" component={MsgEmail} alwaysShow />
        <PageTab title="webhook日志" tabKey="choerodon.code.site.manager.message-log.ps.webhook" component={MsgWebhook} alwaysShow />
      </PageWrap>
    </StoreProvider>

  );
}
export default MsgRecord;
