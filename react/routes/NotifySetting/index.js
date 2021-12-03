import React from 'react';
import { PageWrap, PageTab } from '@choerodon/boot';
import { useFormatMessage } from '@choerodon/master';
import { StoreProvider } from './Store';
import MailSetting from './mail-setting';
import SmsSetting from './sms-setting';

export default (props) => {
  const format = useFormatMessage('c7n.notify-setting');
  return (
    <StoreProvider {...props}>
      <PageWrap noHeader={[]}>
        <PageTab route="/notify/msg-config/email" title={format({ id: 'emailConfig' })} tabKey="choerodon.code.site.setting.notify.msg-config.ps.email" component={MailSetting} />
        <PageTab route="/notify/msg-config/sms" title={format({ id: 'SMSConfig' })} tabKey="choerodon.code.site.setting.notify.msg-config.ps.sms" component={SmsSetting} />
      </PageWrap>
    </StoreProvider>
  );
};
