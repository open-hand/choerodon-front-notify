import React, { Component, useContext, useState, useRef, useMemo } from 'react/index';
import { Table, Button, Tree, Icon, TextField, Modal, Tooltip } from 'choerodon-ui/pro';
import { Header, axios, Page, Breadcrumb, Content, PageTab, Action, Permission } from '@choerodon/boot';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import EditSendSettings from './Sider/EditSendSettings';
import EditTemplate from './Sider/EditTemplate';
import Store from './Store';
import DragBar from '../../components/drag-bar';

import ToggleMessageType from './ToggleMessageType';
import './TableMessage.less';

const modalKey = Modal.key();
const { Column } = Table;
const cssPrefix = 'c7n-notify-contentList';
// 设置邮件，设置短信，设置站内信
export default observer(() => {
  const context = useContext(Store);
  const {
    queryTreeDataSet,
    messageTypeTableDataSet,
    messageTypeDetailDataSet,
    history,
    currentPageType,
    setCurrentPageType,
    intl: { formatMessage },
    messageStore,
  } = context;
  const [inputValue, setInputValue] = useState('');
  let disableModal;

  function getTitle(record) {
    const name = record.get('name') && record.get('name').toLowerCase();
    const searchValue = inputValue.toLowerCase();
    const index = name.indexOf(searchValue);
    const beforeStr = name.substr(0, index).toLowerCase();
    const afterStr = name.substr(index + searchValue.length).toLowerCase();
    const title = index > -1 ? (
      <span className={`${cssPrefix}-text-title`}>
        {beforeStr}
        <span style={{ color: '#f50' }}>{inputValue.toLowerCase()}</span>
        {afterStr}
      </span>
    ) : (<span className={`${cssPrefix}-text-title`}>{name}</span>);
    return (
      <Tooltip title={title} placement="top">
        {title}
      </Tooltip>
    );
  }

  async function handleToggleState(record) {
    const code = record.get('code');

    if (record.get('enabled')) {
      // 停用
      disableModal.close();
      await axios.put(`/hmsg/choerodon/v1/notices/send_settings/update_status?code=${code}&status=false`);
    } else {
      // 启用
      await axios.put(`/hmsg/choerodon/v1/notices/send_settings/update_status?code=${code}&status=true`);
    }
    await queryTreeDataSet.query();
    const { currentCode, currentSelectedType } = currentPageType;
    if (currentSelectedType === 'table') {
      await messageTypeTableDataSet.query();
    } else if (code === currentCode) {
      await messageTypeDetailDataSet.query();
    }
  }

  function openStopModal(record) {
    disableModal = Modal.open({
      key: modalKey,
      title: formatMessage({ id: 'disable' }),
      children: formatMessage({ id: 'notify-lists.disable.message' }),
      okText: formatMessage({ id: 'disable' }),
      onOk: () => handleToggleState(record),
    });
  }

  function getAction(record) {
    const { children } = record;
    const enabled = record.get('enabled');
    const actionDatas = [
      {
        text: enabled ? formatMessage({ id: 'disable' }) : formatMessage({ id: 'enable' }),
        action: () => (enabled ? openStopModal(record) : handleToggleState(record)),
      },
    ];
    if (!['undefined', 'null'].includes(String(enabled))) {
      return (
        <Permission
          service={['choerodon.code.site.setting.notify.msg-service.ps.disable']}
        >
          <Action style={{ position: 'absolute', right: '0.05rem' }} data={actionDatas} onClick={(e) => e.stopPropagation()} />
        </Permission>
      );
    }
    return null;
  }

  const treeNodeRenderer = ({ record }) => {
    const { parent, children, level } = record;
    const treeIcon = () => {
      // 最上层节点, 展开
      if (!parent && record.get('expand')) {
        return <Icon type="folder_open2" />;
      }
      // 最上层节点，未展开
      if (!parent && !record.get('expand')) {
        return <Icon type="folder_open" />;
      }
      // 最底层节点
      if (level === 2) {
        return (
          <span
            className={`${cssPrefix}-circle`}
            style={{ backgroundColor: record.get('enabled') ? '#00BFA5' : 'rgba(0,0,0,0.20)' }}
          />
        );
      }
      return <Icon type="textsms" />;
    };

    const toggleContentRenderer = () => {
      if (!parent) {
        messageTypeTableDataSet.setQueryParameter('secondCode', undefined);
        messageTypeTableDataSet.setQueryParameter('firstCode', record.get('code'));
        messageTypeTableDataSet.query();
        setCurrentPageType({
          currentSelectedType: 'table',
          icon: 'folder_open2',
          title: record.get('name'),
        });
      } else if (level === 2) {
        // messageTypeDetailDataSet.setQueryParameter('code', record.get('code'));
        messageTypeDetailDataSet.setQueryParameter('tempServerCode', record.get('code'));
        messageTypeDetailDataSet.query();
        setCurrentPageType({
          currentSelectedType: 'form',
          currentCode: record.get('code'),
        });
      } else {
        messageTypeTableDataSet.setQueryParameter('firstCode', record.parent.get('code'));
        messageTypeTableDataSet.setQueryParameter('secondCode', record.get('code'));
        messageTypeTableDataSet.query();
        setCurrentPageType({
          currentSelectedType: 'table',
          icon: 'textsms',
          title: record.get('name'),
        });
      }
    };

    return (
      <div onClick={toggleContentRenderer} className={`${cssPrefix}-text`}>
        <span className={`${cssPrefix}-icon`}>{treeIcon()}</span>
        {getTitle(record)}
        {getAction(record)}
      </div>
    );
  };

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
        <Permission service={['choerodon.code.site.setting.notify.msg-service.ps.send-config']}>
          <Button icon="mode_edit" onClick={editSendSettings}>修改发送设置</Button>
        </Permission>
        <Permission service={['choerodon.code.site.setting.notify.msg-service.ps.email-template']}>
          <Button icon="mode_edit" onClick={() => editTemplate('EMAIL', '修改邮件模板')}>修改邮件模板</Button>
          <Button icon="mode_edit" onClick={() => editTemplate('WEB', '修改站内信模板')}>修改站内信模板</Button>
          <Button icon="mode_edit" onClick={() => editTemplate('webHookJson', '修改webhook-Json模板')}>修改webhook-Json模板</Button>
          <Button icon="mode_edit" onClick={() => editTemplate('webHookOther', '修改webhook-钉钉微信模板')}>修改webhook-钉钉微信模板</Button>
          <Button icon="mode_edit" onClick={() => editTemplate('SMS', '修改短信模板')}>修改短信模板</Button>
        </Permission>
      </Header>
    );
  }
  function handleSearch(value) {
    setInputValue(value);
  }
  function handleInput(e) {
    setInputValue(e.target.value);
  }

  function handleExpand(e) {
    runInAction(() => {
      queryTreeDataSet.forEach((record) => {
        record.set('expand', false);
        messageStore.setExpandedKeys([]);
      });
      const expandedKeys = [];
      queryTreeDataSet.forEach((record) => {
        if (record.get('name').toLowerCase().includes(inputValue.toLowerCase())) {
          while (record.parent) {
            record.parent.set('expand', true);
            record = record.parent;
            expandedKeys.push(String(record.get('id')));
          }
        }
      });
      messageStore.setExpandedKeys(expandedKeys);
    });
  }

  function handleExpanded(keys) {
    messageStore.setExpandedKeys(keys);
  }

  const rootRef = useRef(null);

  const bounds = useMemo(() => messageStore.getNavBounds, [messageStore.getNavBounds]);

  return (
    <Page
      service={['choerodon.code.site.setting.notify.msg-service.ps.default']}
    >
      {getPageHeader()}
      <Breadcrumb />
      <Content className={cssPrefix}>
        <div
          ref={rootRef}
          style={{ width: '100%', height: '100%', position: 'relative', display: 'flex' }}
        >
          <DragBar parentRef={rootRef} store={messageStore} />
          <div className={`${cssPrefix}-tree`}>
            <TextField
              name="id"
              className={`${cssPrefix}-tree-query`}
              prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,0.65)' }} />}
              placeholder="请输入搜索条件"
              onInput={handleInput}
              onChange={handleSearch}
              value={inputValue}
              onEnterDown={handleExpand}
            />
            <nav style={bounds} className={`${cssPrefix}-tree-sider-bar`}>
              <Tree
                dataSet={queryTreeDataSet}
                renderer={treeNodeRenderer}
                onExpand={handleExpanded}
              />
            </nav>
          </div>
          <div className={`${cssPrefix}-rightContent`}>
            <ToggleMessageType />
          </div>
        </div>
      </Content>
    </Page>
  );
});
