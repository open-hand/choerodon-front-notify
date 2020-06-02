import React, { useState, useEffect } from 'react';
import { PageTab, PageWrap } from '@choerodon/boot';
import { withRouter } from 'react-router-dom';
import { StoreProvider } from './stores';
import WebhookContent from '../WebhooksSetting';
import AgileContent from './agile';
import DevopsContent from './devops';
import ResourceContent from './resource';
import Tips from '../../components/tips';

import './index.less';

export default withRouter(props => {
  const [isOPERATIONS, setIsOPERATIONS] = useState(false);
  const [isAfterEffect, setIsAfterEffect] = useState(false);

  useEffect(() => {
    const pattern = new URLSearchParams(window.location.hash);
    if (pattern.get('category') === 'OPERATIONS') {
      setIsOPERATIONS(true);
    }
    setIsAfterEffect(true);
  }, []);

  const renderPageTab = () => {
    if (isAfterEffect) {
      const origin = [{
        route: '/notify/project-notify/devops',
        title: 'Devops消息',
        tabKey: 'choerodon.code.project.setting-notify-devops',
        component: DevopsContent,
      }, {
        route: '/notify/project-notify/resource',
        title: <Tips title="资源删除验证" helpText="资源删除验证用于为项目下所有环境中的资源删除操作配置二次确认的通知信息，配置成功后，当用户在执行相应的删除操作时，就需要输入验证码进行二次确认" placement="topLeft" />,
        tabKey: 'choerodon.code.project.setting-notify-resource',
        component: ResourceContent,
      }, {
        route: '/notify/project-notify/webhook',
        title: 'Webhook配置',
        tabKey: 'choerodon.code.project.setting-notify-webhook',
        component: WebhookContent,
      }];
      if (!isOPERATIONS) {
        origin.unshift({
          route: '/notify/project-notify/agile',
          title: '敏捷消息',
          tabKey: 'choerodon.code.project.setting-notify-agile',
          component: AgileContent,
        });
      }
      return (
        <PageWrap noHeader={['choerodon.code.project.setting-notify-agile', 'choerodon.code.project.setting-notify-devops', 'choerodon.code.project.setting-notify-resource']}>
          {origin.map(o => <PageTab route={o.route} title={o.title} tabKey={o.tabKey} component={o.component} />)}
        </PageWrap>
      );
    }
    return null;
  };

  return (
    <StoreProvider {...props}>
      {renderPageTab()}
    </StoreProvider>
  );
});
