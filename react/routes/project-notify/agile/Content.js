/* eslint-disable react/jsx-no-bind */
import React, { useCallback, useRef } from 'react';
import {
  TabPage, Content, Breadcrumb, Choerodon, Permission,
} from '@choerodon/boot';
import {
  Table, CheckBox, Select, Icon, Tooltip,
} from 'choerodon-ui/pro';
import { Prompt, useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAgileContentStore } from './stores';
import NotifyObject from '../components/notify-object';
import MouserOverWrapper from '../../../components/mouseOverWrapper';
import FooterButtons from '../components/footer-buttons';
import { useProjectNotifyStore } from '../stores';

const { Column } = Table;

export default observer((props) => {
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    tableDs,
    allSendRoleList,
    permissions,
  } = useAgileContentStore();
  const isTriggerHiddenRef = useRef(true);
  const history = useHistory();
  const {
    promptMsg,
  } = useProjectNotifyStore();

  async function refresh() {
    tableDs.query();
  }

  async function saveSettings() {
    try {
      if (await tableDs.submit() !== false) {
        refresh();
      }
    } catch (e) {
      Choerodon.handleResponseError(e);
    }
  }

  function handlePmHeaderChange(value, name, nameFlag) {
    tableDs.forEach((record) => record.get(nameFlag) && record.set(name, value));
  }

  function renderCheckBoxHeader(name, nameFlag) {
    const disabled = !tableDs.find((record) => record.get(nameFlag));
    const isChecked = !disabled && tableDs.totalCount && !tableDs.find((record) => !record.get(name) && record.get(nameFlag));
    const pmRecords = tableDs.find((record) => record.get(name) && record.get(nameFlag));
    return (
      <CheckBox
        checked={!!isChecked}
        indeterminate={!isChecked && !!pmRecords}
        disabled={disabled}
        onChange={(value) => handlePmHeaderChange(value, name, nameFlag)}
      >
        {formatMessage({ id: `${intlPrefix}.${name}` })}
      </CheckBox>
    );
  }

  function renderCheckBox({ record, name, nameFlag }) {
    return (
      <CheckBox
        record={record}
        name={name}
        checked={record.get(name)}
        disabled={!record.get(nameFlag)}
        onChange={(value) => record.set(name, value)}
      />
    );
  }
  function handleLinkStateMachine() {
    history.push(`/agile/state-machine${history.location.search}&activeKey=custom`);
  }
  const handleTooltipMouseLeave = useCallback(() => Tooltip.hide(), []);
  const handleTooltipMouseEnter = useCallback((e, title) => {
    isTriggerHiddenRef.current && Tooltip.show(e.target, {
      title,
      placement: 'topLeft',
    });
  }, []);
  function renderNotifyObject({ record }) {
    const data = [];
    const userList = record.get('userList');
    const sendRoleList = record.get('sendRoleList');
    const code = record.get('code');
    let excludesRole = [];
    let intlObjectPrefix = `${intlPrefix}.object.`;
    switch (code) {
      case 'ISSUE_DAILY_WORK':
        return <span>-</span>;
      case 'ISSUECHANGESTATUS':
        return <span role="none" className={`${prefixCls}-page-content-link`} onClick={handleLinkStateMachine}>请前往状态机-自定义流转设置</span>;
      case 'ISSUECREATE': {
        excludesRole = ['starUser'];
        break;
      }
      case 'BACKLOG_FEEDBACK': {
        excludesRole = ['mainResponsible', 'participant'];
        intlObjectPrefix = `${intlPrefix}.object.backlog_`;
        break;
      }
      case 'SPRINT_DELAY': {
        excludesRole = ['assignee', 'reporter', 'starUser', 'mainResponsible', 'participant'];
        break;
      }
      default: {
        break;
      }
    }
    sendRoleList.forEach((key) => {
      if (key !== 'specifier') {
        const text = ['reporter', 'assignee', 'starUser', 'mainResponsible', 'projectOwner', 'participant'].includes(key) ? formatMessage({ id: `${intlObjectPrefix}${key}` })
          : allSendRoleList.find((item) => item.code === key)?.name;
        data.push(text);
      } else if (userList && userList.length) {
        const names = userList.map(({ realName }) => realName);
        data.push(...names);
      }
    });
    return (
      <span onMouseEnter={(e) => handleTooltipMouseEnter(e, data.join())} onMouseLeave={handleTooltipMouseLeave}>
        <Select
          popupContent={(
            <NotifyObject
              record={record}
              allSendRoleList={allSendRoleList}
              excludesRole={excludesRole}
            />
          )}
          onPopupHiddenChange={(hidden) => {
            isTriggerHiddenRef.current = hidden;
            if (!hidden) {
              handleTooltipMouseLeave();
            }
          }}
          popupCls={`${prefixCls}-object-select-popup`}
          popupStyle={{ maxWidth: '3.2rem' }}
          dropdownMatchSelectWidth={false}
          renderer={() => (
            <div className={`${prefixCls}-object-select-render`}>
              {data.join() || '-'}
            </div>
          )}
          trigger={['click']}
          placement="bottomLeft"
          className={`${prefixCls}-object-select`}
        />
      </span>
    );
  }

  return (
    <TabPage service={['choerodon.code.project.setting.setting-notify.ps.agile']}>
      <Breadcrumb />
      <Prompt message={promptMsg} wrapper="c7n-iam-confirm-modal" when={tableDs.dirty} />
      <Content className={`${prefixCls}-page-content`}>
        <Table dataSet={tableDs}>
          <Column
            name="name"
            width={210}
          />
          <Column
            header={() => renderCheckBoxHeader('pmEnable', 'pmEnabledFlag')}
            width={160}
            renderer={({ record }) => renderCheckBox({ record, name: 'pmEnable', nameFlag: 'pmEnabledFlag' })}
            align="left"
          />
          <Column
            header={() => renderCheckBoxHeader('emailEnable', 'emailEnabledFlag')}
            width={160}
            renderer={({ record }) => renderCheckBox({ record, name: 'emailEnable', nameFlag: 'emailEnabledFlag' })}
            align="left"
          />
          <Column renderer={renderNotifyObject} header={formatMessage({ id: `${intlPrefix}.noticeObject` })} />
        </Table>
        <Permission
          service={['choerodon.code.project.setting.setting-notify.ps.agile-save']}
        >
          <FooterButtons onOk={saveSettings} onCancel={refresh} />
        </Permission>
      </Content>
    </TabPage>
  );
});
