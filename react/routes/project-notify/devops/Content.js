import React from 'react';
import {
  TabPage, Content, Breadcrumb, Choerodon, Permission,
} from '@choerodon/boot';
import {
  Table, CheckBox, Select, Tooltip,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Prompt } from 'react-router-dom';
import { useDevopsContentStore } from './stores';
import FooterButtons from '../components/footer-buttons';
import { useProjectNotifyStore } from '../stores';
import Tips from '../../../components/tips';
import NotifyObject from '../components/notify-object';

const { Column } = Table;

export default observer((props) => {
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    tableDs,
    permissions,
  } = useDevopsContentStore();
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

  function handleHeaderChange(value, type, flagName) {
    tableDs.forEach((record) => record.get(flagName) && record.set(type, value));
  }

  function renderCheckBoxHeader(name, flagName) {
    const disabled = !tableDs.find((record) => record.get(flagName));
    const isChecked = !disabled && tableDs.totalCount && !tableDs.find((record) => !record.get(name) && record.get(flagName));
    const hasCheckedRecord = tableDs.find((record) => record.get(name) && record.get(flagName));
    return (
      <CheckBox
        checked={!!isChecked}
        indeterminate={!isChecked && !!hasCheckedRecord}
        disabled={disabled}
        onChange={(value) => handleHeaderChange(value, name, flagName)}
      >
        {formatMessage({ id: `${intlPrefix}.${name}` })}
      </CheckBox>
    );
  }

  function handleCheckBoxChange({
    record, value, name, flagName,
  }) {
    record.set(name, value);
    if (!record.get('groupId')) {
      tableDs.forEach((tableRecord) => {
        if (tableRecord.get('groupId') === record.get('key') && tableRecord.get(flagName)) {
          tableRecord.set(name, value);
        }
      });
    } else {
      const parentRecord = tableDs.find((tableRecord) => record.get('groupId') === tableRecord.get('key'));
      const parentIsChecked = !tableDs.find((tableRecord) => parentRecord.get('key') === tableRecord.get('groupId') && !tableRecord.get(name) && tableRecord.get(flagName));
      parentRecord.set(name, parentIsChecked && parentRecord.get(flagName));
    }
  }

  function renderCheckBox({ record, name, flagName }) {
    const disabled = !record.get(flagName);
    const checked = record.get(name);
    const isIndeterminate = !record.get('groupId') && !!tableDs.find((tableRecord) => tableRecord.get('groupId') === record.get('key') && tableRecord.get(name) && tableRecord.get(flagName));
    return (
      <CheckBox
        record={record}
        name={name}
        checked={checked}
        indeterminate={!checked && isIndeterminate}
        disabled={disabled}
        onChange={(value) => handleCheckBoxChange({
          record, value, name, flagName,
        })}
      />
    );
  }

  function renderNotifyObject({ record, value }) {
    if (!record.get('groupId')) {
      return '-';
    }
    if (record.get('code') === 'PIPELINESUCCESS' || record.get('code') === 'PIPELINEFAILED') {
      const data = [value];
      const userList = record.get('userList');
      userList.forEach(({ realName }) => {
        data.push(realName);
      });
      return (
        <Select
          popupContent={(
            <NotifyObject
              record={record}
              allSendRoleList={['pipelineTriggers', 'specifier']}
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
      );
    }
    return value;
  }

  return (
    <TabPage service={['choerodon.code.project.setting.setting-notify.ps.devops']}>
      <Breadcrumb />
      <Prompt message={promptMsg} wrapper="c7n-iam-confirm-modal" when={tableDs.dirty} />
      <Content className={`${prefixCls}-page-content`}>
        <Table dataSet={tableDs} mode="tree">
          <Column name="name" />
          <Column
            header={() => renderCheckBoxHeader('pmEnable', 'pmEnabledFlag')}
            renderer={({ record }) => renderCheckBox({ record, name: 'pmEnable', flagName: 'pmEnabledFlag' })}
            editor
            width={150}
            align="left"
          />
          <Column
            header={() => renderCheckBoxHeader('emailEnable', 'emailEnabledFlag')}
            renderer={({ record }) => renderCheckBox({ record, name: 'emailEnable', flagName: 'emailEnabledFlag' })}
            editor
            width={150}
            align="left"
          />
          <Column
            name="notifyObject"
            header={<Tips title={formatMessage({ id: `${intlPrefix}.noticeObject` })} helpText={formatMessage({ id: `${intlPrefix}.noticeObject.devops.tips` })} />}
            renderer={renderNotifyObject}
          />
        </Table>
        <Permission
          service={['choerodon.code.project.setting.setting-notify.ps.devops-save']}
        >
          <FooterButtons onOk={saveSettings} onCancel={refresh} />
        </Permission>
      </Content>
    </TabPage>
  );
});
