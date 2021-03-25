import React from 'react';
import { PageWrap, PageTab } from '@choerodon/boot';
import { StoreProvider } from './Store';
import MailSetting from './mail-setting';
import SmsSetting from './sms-setting';

export default (props) => (
  <StoreProvider {...props}>
    <PageWrap noHeader={[]}>
      <PageTab route="/notify/msg-config/email" title="邮箱配置" tabKey="choerodon.code.site.setting.notify.msg-config.ps.email" component={MailSetting} />
      <PageTab route="/notify/msg-config/sms" title="短信配置" tabKey="choerodon.code.site.setting.notify.msg-config.ps.sms" component={SmsSetting} />
    </PageWrap>
  </StoreProvider>
);
