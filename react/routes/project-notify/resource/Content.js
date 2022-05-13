import React, { Fragment } from 'react';
import {
  TabPage, Content, Breadcrumb, Choerodon, Permission,
} from '@choerodon/boot';
import {
  Table, CheckBox, Icon, Dropdown, Spin, Select, Tooltip,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Prompt } from 'react-router-dom';
import { useResourceContentStore } from './stores';
import NotifyObject from '../components/notify-object';
import MouserOverWrapper from '../../../components/mouseOverWrapper';
import FooterButtons from '../components/footer-buttons';
import { useProjectNotifyStore } from '../stores';
import Tips from '../../../components/tips';
import EmptyPage from '../../../components/empty-page';

const { Column } = Table;

export default observer((props) => {
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    tableDs,
    allSendRoleList,
    permissions,
    resourceStore: { getLoading, getEnabled },
  } = useResourceContentStore();
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
    if (!record.get('envId')) {
      tableDs.forEach((tableRecord) => {
        if (tableRecord.get('envId') === record.get('key') && tableRecord.get(flagName)) {
          tableRecord.set(name, value);
        }
      });
    } else {
      const parentRecord = tableDs.find((tableRecord) => record.get('envId') === tableRecord.get('key'));
      const parentIsChecked = !tableDs.find((tableRecord) => parentRecord.get('key') === tableRecord.get('envId') && !tableRecord.get(name) && tableRecord.get(flagName));
      parentRecord.set(name, parentIsChecked && parentRecord.get(flagName));
    }
  }

  function renderCheckBox({ record, name, flagName }) {
    const checked = record.get(name);
    const disabled = !record.get(flagName);
    const isIndeterminate = !record.get('envId') && !!tableDs.find((tableRecord) => tableRecord.get('envId') === record.get('key') && tableRecord.get(name) && tableRecord.get(flagName));
    return (
      <CheckBox
        record={record}
        name={name}
        checked={checked}
        disabled={disabled}
        indeterminate={!checked && isIndeterminate}
        onChange={(value) => handleCheckBoxChange({
          record, value, name, flagName,
        })}
      />
    );
  }

  function renderNotifyObject({ record }) {
    if (!record.get('envId')) {
      return '-';
    }

    const data = [];
    const userList = record.get('userList');
    const sendRoleList = record.get('sendRoleList');
    sendRoleList.forEach((key) => {
      if (key !== 'specifier') {
        data.push(formatMessage({ id: `${intlPrefix}.object.${key}` }));
      } else if (userList && userList.length) {
        const names = userList.map(({ realName }) => realName);
        data.push(...names);
      }
    });

    return (
      <Select
        popupContent={(
          <NotifyObject
            record={record}
            allSendRoleList={allSendRoleList}
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

  function getContent() {
    if (getLoading) {
      return <Spin spinning style={{ textAlign: 'center' }} />;
    }
    if (getEnabled) {
      return (
        <>
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
              header={() => renderCheckBoxHeader('smsEnable', 'smsEnabledFlag')}
              renderer={({ record }) => renderCheckBox({ record, name: 'smsEnable', flagName: 'smsEnabledFlag' })}
              editor
              width={150}
              align="left"
            />
              <Column
              header={() => renderCheckBoxHeader('dtEnable', 'dtEnabledFlag')}
              renderer={({ record }) => renderCheckBox({ record, name: 'dtEnable', flagName: 'dtEnabledFlag' })}
              editor
              width={150}
              align="left"
            />

            <Column
              header={<Tips title={formatMessage({ id: `${intlPrefix}.noticeObject` })} helpText={formatMessage({ id: `${intlPrefix}.noticeObject.resource.tips` })} />}
              renderer={renderNotifyObject}
            />
          </Table>
          <Permission
            service={['choerodon.code.project.setting.setting-notify.ps.resourcdelete-save']}
          >
            <FooterButtons onOk={saveSettings} onCancel={refresh} />
          </Permission>
        </>
      );
    }
    return (
      <EmptyPage
        title={formatMessage({ id: `${intlPrefix}.empty.title` })}
        describe={formatMessage({ id: `${intlPrefix}.empty.des` })}
      />
    );
  }

  return (
    <TabPage service={['choerodon.code.project.setting.setting-notify.ps.resource']}>
      <Breadcrumb />
      <Prompt message={promptMsg} wrapper="c7n-iam-confirm-modal" when={tableDs.dirty} />
      <Content className={`${prefixCls}-page-content`}>
        {getContent()}
      </Content>
    </TabPage>
  );
});
