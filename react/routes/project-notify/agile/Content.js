import React from 'react';
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
  function renderNotifyObject({ record }) {
    const data = [];
    const userList = record.get('userList');
    const sendRoleList = record.get('sendRoleList');
    const isBacklogFeedback = record.get('code') === 'BACKLOG_FEEDBACK';

    sendRoleList.forEach((key) => {
      if (key !== 'specifier') {
        const text = ['reporter', 'assignee', 'starUser', 'projectOwner'].includes(key) ? formatMessage({ id: `${intlPrefix}.object.${isBacklogFeedback ? `backlog_${key}` : key}` })
          : allSendRoleList.find((item) => item.code === key)?.name;
        data.push(text);
      } else if (userList && userList.length) {
        const names = userList.map(({ realName }) => realName);
        data.push(...names);
      }
    });
    let excludesRole = record.get('code') === 'SPRINT_DELAY' ? ['assignee', 'reporter', 'starUser'] : [];
    if (record.get('code') === 'ISSUECREATE') {
      excludesRole = ['starUser'];
    }
    return record.get('code') !== 'ISSUECHANGESTATUS' ? (
      <Select
        popupContent={(
          <NotifyObject
            record={record}
            allSendRoleList={allSendRoleList}
            excludesRole={excludesRole}
          />
        )}
        renderer={() => (
          <Tooltip title={data.join()}>
            <div className={`${prefixCls}-object-select-render`}>
              {data.join() || '-'}
            </div>
          </Tooltip>
        )}
        trigger={['click']}
        placement="bottomLeft"
        className={`${prefixCls}-object-select`}
      />
    ) : <span role="none" className={`${prefixCls}-page-content-link`} onClick={handleLinkStateMachine}>请前往状态机-自定义流转设置</span>;
  }

  return (
    <TabPage service={['choerodon.code.project.setting.setting-notify.ps.agile']}>
      <Breadcrumb />
      <Prompt message={promptMsg} wrapper="c7n-iam-confirm-modal" when={tableDs.dirty} />
      <Content className={`${prefixCls}-page-content`}>
        <Table dataSet={tableDs}>
          <Column name="name" />
          <Column
            header={() => renderCheckBoxHeader('pmEnable', 'pmEnabledFlag')}
            renderer={({ record }) => renderCheckBox({ record, name: 'pmEnable', nameFlag: 'pmEnabledFlag' })}
            align="left"
          />
          <Column
            header={() => renderCheckBoxHeader('emailEnable', 'emailEnabledFlag')}
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
