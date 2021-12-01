import React, { useState, useMemo, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import {
  Tree, Icon, TextField, Modal, Tooltip,
} from 'choerodon-ui/pro';
import { axios, Action, Permission } from '@choerodon/boot';

import Store from './Store';

const cssPrefix = 'c7n-notify-contentList';
const modalKey = Modal.key();

export default observer(() => {
  const context = useContext(Store);
  const {
    queryTreeDataSet,
    messageTypeTableDataSet,
    messageTypeDetailDataSet,
    currentPageType,
    setCurrentPageType,
    intl: { formatMessage },
    messageStore,
    formatCommon,
  } = context;

  const [inputValue, setInputValue] = useState('');
  let disableModal;

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

  function getTitle(record) {
    const name = record.get('name') && record.get('name').toLowerCase();
    const searchValue = inputValue?.toLowerCase();
    const index = name.indexOf(searchValue);
    const beforeStr = name.substr(0, index).toLowerCase();
    const afterStr = name.substr(index + searchValue?.length).toLowerCase();
    const title = index > -1 ? (
      <span className={`${cssPrefix}-text-title`}>
        {beforeStr}
        <span style={{ color: '#f50' }}>{inputValue?.toLowerCase()}</span>
        {afterStr}
      </span>
    ) : (<span className={`${cssPrefix}-text-title`}>{name}</span>);
    return (
      <Tooltip title={title} placement="top">
        {title}
      </Tooltip>
    );
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
      <div onClick={toggleContentRenderer} className={`${cssPrefix}-text`} role="none">
        <span className={`${cssPrefix}-icon`}>{treeIcon()}</span>
        {getTitle(record)}
        {getAction(record)}
      </div>
    );
  };

  const handleSearch = (value) => {
    setInputValue(value);
  };
  const handleInput = (e) => {
    setInputValue(e.target.value);
  };

  const handleExpand = (e) => {
    if (inputValue) {
      runInAction(() => {
        queryTreeDataSet.forEach((record) => {
          record.set('expand', false);
          messageStore.setExpandedKeys([]);
        });
        const expandedKeys = [];
        queryTreeDataSet.map((record) => {
          if (record.get('name').toLowerCase().includes(inputValue?.toLowerCase())) {
            while (record.parent) {
              record.parent.set('expand', true);
              expandedKeys.push(String(record.get('id')));
              return record.parent;
            }
          }
          return record;
        });
        messageStore.setExpandedKeys(expandedKeys);
      });
    }
  };

  const handleExpanded = (keys) => {
    messageStore.setExpandedKeys(keys);
  };
  const bounds = useMemo(() => messageStore.getNavBounds, [messageStore.getNavBounds]);

  return (
    <nav style={bounds} className={`${cssPrefix}-tree-sider-bar`}>
      <TextField
        name="id"
        className={`${cssPrefix}-tree-query`}
        prefix={<Icon type="search" />}
        placeholder={formatCommon({ id: 'pleaseSearch' })}
        onInput={handleInput}
        onChange={handleSearch}
        value={inputValue}
        onEnterDown={handleExpand}
        clearButton
        onClear={() => {
          setInputValue('');
          queryTreeDataSet.forEach((record) => {
            record.set('expand', false);
            messageStore.setExpandedKeys([]);
          });
        }}
      />
      <Tree
        dataSet={queryTreeDataSet}
        renderer={treeNodeRenderer}
        onExpand={handleExpanded}
      />
    </nav>
  );
});
