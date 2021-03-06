import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { asyncLocaleProvider, asyncRouter, nomatch } from '@choerodon/boot';
import { ModalContainer } from 'choerodon-ui/pro';
import { PermissionRoute } from '@choerodon/master';

const msgRecord = asyncRouter(() => import('./routes/global/msg-record'));
const announcement = asyncRouter(() => import('./routes/announcement'));
const receiveSetting = asyncRouter(() => import('./routes/receive-setting'));
const notifySetting = asyncRouter(() => import('./routes/NotifySetting'));
const notifyList = asyncRouter(() => import('./routes/NotifyList/route'));
const webhooksSetting = asyncRouter(() => import('./routes/WebhooksSetting'));
const projectNotify = asyncRouter(() => import('./routes/project-notify'));

function LowCodeIndex({ match, AppState: { currentLanguage: language } }) {
  const IntlProviderAsync = asyncLocaleProvider(language, () => import(`./locale/${language}`));
  return (
    <IntlProviderAsync>
      <>
        <Switch>
          <PermissionRoute
            path={`${match.url}/msg-log`}
            component={msgRecord}
            service={[
              'choerodon.code.site.manager.message-log.ps.email',
              'choerodon.code.site.manager.message-log.ps.webhook',
            ]}
          />
          <Route path={`${match.url}/announcement`} component={announcement} />
          <Route path={`${match.url}/receive-setting`} component={receiveSetting} />
          <PermissionRoute
            path={`${match.url}/msg-config`}
            component={notifySetting}
            service={[
              'choerodon.code.site.setting.notify.msg-config.ps.email',
              'choerodon.code.site.setting.notify.msg-config.ps.sms',
            ]}
          />
          <Route path={`${match.url}/msg-service`} component={notifyList} />
          <PermissionRoute path={`${match.url}/webhooks-setting`} component={webhooksSetting} service={['choerodon.code.organization.setting.webhooks-setting.ps.default']} />
          <PermissionRoute
            path={`${match.url}/project-notify`}
            component={projectNotify}
            service={[
              'choerodon.code.project.setting.setting-notify.ps.agile',
              'choerodon.code.project.setting.setting-notify.ps.devops',
              'choerodon.code.project.setting.setting-notify.ps.resource',
              'choerodon.code.project.setting.setting-notify.ps.webhook',
            ]}
          />
          <Route path="*" component={nomatch} />
        </Switch>
        <ModalContainer />
      </>
    </IntlProviderAsync>
  );
}

export default inject('AppState')(LowCodeIndex);
