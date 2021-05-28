import React, { useContext, useRef } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import {
  Header, Page, Breadcrumb, Content, Permission,
} from '@choerodon/boot';
import { HeaderButtons } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import EditSendSettings from './Sider/EditSendSettings';
import EditTemplate from './Sider/EditTemplate';
import Store from './Store';
import DragBar from '../../components/drag-bar';
import TreeView from './TreeView';

import ToggleMessageType from './ToggleMessageType';
import './TableMessage.less';

const cssPrefix = 'c7n-notify-contentList';
// 设置邮件，设置短信，设置站内信
export default observer(() => {
  const context = useContext(Store);
  const {
    messageTypeDetailDataSet,
    currentPageType,
    intl: { formatMessage },
    messageStore,
  } = context;

  function editSendSettings() {
    Modal.open({
      title: '修改发送设置',
      drawer: true,
      style: { width: 740 },
      children: <EditSendSettings context={context} />,
    });
  }

  function editTemplate(type, title) {
    messageTypeDetailDataSet.children.messageTemplateVOS.reset();
    Modal.open({
      title,
      drawer: true,
      style: { width: type === 'sms' ? '3.8rem' : '7.4rem' },
      children: <EditTemplate type={type} context={context} />,
    });
  }

  function getPageHeader() {
    return currentPageType.currentSelectedType === 'form' && (
      <Header>
        <HeaderButtons
          items={[{
            permissions: ['choerodon.code.site.setting.notify.msg-service.ps.send-config'],
            name: '修改发送设置',
            icon: 'edit-o',
            handler: editSendSettings,
            display: true,
          }, {
            icon: 'edit-o',
            name: '修改模板',
            groupBtnItems: [{
              permissions: ['choerodon.code.site.setting.notify.msg-service.ps.email-template'],
              name: '修改邮件模板',
              handler: () => editTemplate('EMAIL', '修改邮件模板'),
              display: true,
            }, {
              permissions: ['choerodon.code.site.setting.notify.msg-service.ps.email-template'],
              name: '修改站内信模板',
              handler: () => editTemplate('WEB', '修改站内信模板'),
              display: true,
            }, {
              permissions: ['choerodon.code.site.setting.notify.msg-service.ps.email-template'],
              name: '修改webhook-Json模板',
              handler: () => editTemplate('webHookJson', '修改webhook-Json模板'),
              display: true,
            }, {
              permissions: ['choerodon.code.site.setting.notify.msg-service.ps.email-template'],
              name: '修改webhook-钉钉微信模板',
              handler: () => editTemplate('webHookOther', '修改webhook-钉钉微信模板'),
              display: true,
            }, {
              permissions: ['choerodon.code.site.setting.notify.msg-service.ps.email-template'],
              name: '修改短信模板',
              handler: () => editTemplate('SMS', '修改短信模板'),
              display: true,
            }],
          }]}
        />
      </Header>
    );
  }

  const rootRef = useRef(null);

  return (
    <Page
      service={['choerodon.code.site.setting.notify.msg-service.ps.default']}
    >
      {getPageHeader()}
      <Breadcrumb />
      <Content className={cssPrefix}>
        <div
          ref={rootRef}
          style={{ width: '100%', position: 'relative', display: 'flex' }}
        >
          <DragBar parentRef={rootRef} store={messageStore} />
          <div className={`${cssPrefix}-tree`}>
            <TreeView />
          </div>
          <div className={`${cssPrefix}-rightContent`}>
            <ToggleMessageType />
          </div>
        </div>
      </Content>
    </Page>
  );
});
