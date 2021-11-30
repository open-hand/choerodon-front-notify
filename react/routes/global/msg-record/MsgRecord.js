import React from 'react';
import { PageWrap, PageTab } from '@choerodon/boot';
import { useFormatMessage } from '@choerodon/master';
import { StoreProvider } from './stores';
import MsgEmail from './msg-email';
import MsgWebhook from './msg-webhook';

import './index.less';

function MsgRecord(props) {
  const format = useFormatMessage('c7n.msgrecord');
  return (
    <StoreProvider {...props}>
      <PageWrap noHeader={['choerodon.code.site.manager.message-log.ps.email', 'choerodon.code.site.manager.message-log.ps.webhook']} cache>
        <PageTab title={format({ id: 'MsgEmail.title' })} tabKey="choerodon.code.site.manager.message-log.ps.email" component={MsgEmail} alwaysShow />
        <PageTab title={format({ id: 'MsgWebhook.title' })} tabKey="choerodon.code.site.manager.message-log.ps.webhook" component={MsgWebhook} alwaysShow />
      </PageWrap>
    </StoreProvider>

  );
}
export default MsgRecord;
