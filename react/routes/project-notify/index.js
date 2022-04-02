import React, { useMemo } from 'react';
import { PageTab, PageWrap } from '@choerodon/boot';
import { withRouter } from 'react-router-dom';
import map from 'lodash/map';
import intersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';
import { StoreProvider, useProjectNotifyStore } from './stores';
import WebhookContent from '../WebhooksSetting';
import AgileContent from './agile';
import DevopsContent from './devops';
import ResourceContent from './resource';
import Tips from '../../components/tips';

import './index.less';

const Content = () => {
  const {
    AppState: { currentMenuType: { categories } },
    formatProjectNotify,
  } = useProjectNotifyStore();

  const categoryCodes = useMemo(() => map(categories || [], 'code'), [categories]);

  const renderPageTab = () => {
    const origin = [{
      route: '/notify/project-notify/webhook',
      title: formatProjectNotify({ id: 'tabs.webhook' }),
      tabKey: 'choerodon.code.project.setting-notify-webhook',
      component: WebhookContent,
    }];
    if (!isEmpty(intersection(categoryCodes, ['N_DEVOPS', 'N_OPERATIONS']))) {
      origin.unshift({
        route: '/notify/project-notify/devops',
        title: formatProjectNotify({ id: 'tabs.devops' }),
        tabKey: 'choerodon.code.project.setting-notify-devops',
        component: DevopsContent,
      }, {
        route: '/notify/project-notify/resource',
        title: <Tips
          title={formatProjectNotify({ id: 'tabs.resource' })}
          helpText="资源删除验证用于为项目下所有环境中的资源删除操作配置二次确认的通知信息，配置成功后，当用户在执行相应的删除操作时，就需要输入验证码进行二次确认"
          placement="topLeft"
        />,
        tabKey: 'choerodon.code.project.setting-notify-resource',
        component: ResourceContent,
      });
    }
    if (categoryCodes.includes('N_AGILE') || categoryCodes.includes('N_WATERFALL')) {
      origin.unshift({
        route: '/notify/project-notify/agile',
        title: formatProjectNotify({ id: 'tabs.agile' }),
        tabKey: 'choerodon.code.project.setting-notify-agile',
        component: AgileContent,
      });
    }
    return (
      <PageWrap noHeader={['choerodon.code.project.setting-notify-agile', 'choerodon.code.project.setting-notify-devops', 'choerodon.code.project.setting-notify-resource']}>
        {origin.map((o) => <PageTab route={o.route} title={o.title} tabKey={o.tabKey} component={o.component} />)}
      </PageWrap>
    );
  };
  return renderPageTab();
};

export default withRouter((props) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
));
