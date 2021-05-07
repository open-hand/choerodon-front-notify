import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from '@choerodon/boot';
import { PermissionRoute } from '@choerodon/master';

const TableMessage = asyncRouter(() => import('./index'));
const notifyContentModify = asyncRouter(() => import('../NotifyContentModify'));

const Index = ({ match }) => (
  <Switch>
    <PermissionRoute
      exact
      path={match.url}
      component={TableMessage}
      service={['choerodon.code.site.setting.notify.msg-service.ps.default']}
    />
    <PermissionRoute
      path={`${match.url}/send-setting/:settingId/:settingBusinessType/:settingType`}
      component={notifyContentModify}
      service={['choerodon.code.site.setting.notify.msg-service.ps.default']}
    />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default Index;
