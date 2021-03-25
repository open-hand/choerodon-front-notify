import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from '@choerodon/boot';
import { PermissionRoute } from '@choerodon/master';

const index = asyncRouter(() => (import('./Announcement')), {
  AnnouncementStore: () => import('../../stores/global/announcement'),
});
// const detail = asyncRouter(() => import('./APIDetail'));

const Index = ({ match }) => (
  <Switch>
    <PermissionRoute
      exact
      path={match.url}
      component={index}
      service={['choerodon.code.site.manager.announcement.ps.default']}
    />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default Index;
