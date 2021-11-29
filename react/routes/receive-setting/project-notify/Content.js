import React from 'react';
import {
  Content, Breadcrumb, Choerodon, TabPage,
} from '@choerodon/boot';
import {
  Table, CheckBox, Button, Pagination, message,
} from 'choerodon-ui/pro';
import { Prompt } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useProjectNotifyStore } from './stores';
import { useReceiveSettingStore } from '../stores';

import './index.less';

const { Column } = Table;

export default observer(() => {
  const {
    intlPrefix,
    prefixCls,
    tableDs,
    receiveStore,
    AppState: { getUserInfo: { id } },
  } = useProjectNotifyStore();

  const {
    promptMsg, formatClient, formatCommon,
  } = useReceiveSettingStore();

  const refresh = async () => {
    await receiveStore.loadReceiveData(id);
    tableDs.query();
  };

  const saveSettings = async () => {
    try {
      if (await tableDs.submit() !== false) {
        refresh();
      }
    } catch (e) {
      Choerodon.handleResponseError(e);
    }
  };

  function handleCheckBoxHeaderChange(value, name) {
    tableDs.forEach((record) => {
      if (!record.get(`${name}Disabled`)) {
        record.set(name, value);
      }
    });
  }

  function renderCheckBoxHeader(dataSet, name) {
    const disabled = !tableDs.find((record) => !record.get(`${name}Disabled`));
    const isChecked = !disabled && tableDs.totalCount && !tableDs.find((record) => !record.get(name) && !record.get(`${name}Disabled`));
    const pmRecords = tableDs.find((record) => record.get(name) && !record.get(`${name}Disabled`));
    return (
      <CheckBox
        checked={!!isChecked}
        indeterminate={!isChecked && !!pmRecords}
        disabled={disabled}
        onChange={(value) => handleCheckBoxHeaderChange(value, name)}
      >
        {formatClient({ id: `${name}` })}
      </CheckBox>
    );
  }

  function getChildrenId(key) {
    const childrenId = [];
    tableDs.forEach((tableRecord) => {
      if (key === tableRecord.get('sourceId')) {
        childrenId.push(tableRecord.get('key'));
      }
    });
    return childrenId;
  }

  function parentItemIsChecked({ record, name }) {
    const parentIsChecked = !tableDs.find((tableRecord) => record.get('key') === tableRecord.get('sourceId') && !tableRecord.get(name) && !tableRecord.get(`${name}Disabled`));
    const realValue = parentIsChecked && !record.get(`${name}Disabled`);
    record.set(name, realValue);
  }

  function handleChecked(name) {
    tableDs.forEach((record) => {
      if (record.get('treeType') === 'group') {
        parentItemIsChecked({ record, name });
      }
    });
    tableDs.forEach((record) => {
      if (record.get('treeType') === 'project') {
        parentItemIsChecked({ record, name });
      }
    });
  }

  function handleCheckBoxChange(record, value, name) {
    if (record.get('treeType') === 'group') {
      tableDs.forEach((tableRecord) => {
        if (tableRecord.get('sourceId') === record.get('key') && !tableRecord.get(`${name}Disabled`)) {
          tableRecord.set(name, value);
        } else if (record.get('sourceId') === tableRecord.get('key')) {
          parentItemIsChecked({ record: tableRecord, name });
        }
      });
    } else if (record.get('treeType') === 'project') {
      const childrenId = getChildrenId(record.get('key'));
      tableDs.forEach((tableRecord) => {
        if (tableRecord.get('sourceId') === record.get('key') && !tableRecord.get(`${name}Disabled`)) {
          tableRecord.set(name, value);
        } else if (childrenId.includes(tableRecord.get('sourceId')) && !tableRecord.get(`${name}Disabled`)) {
          tableRecord.set(name, value);
        }
      });
    } else {
      handleChecked(name);
    }
  }

  function renderCheckBox({ record, name }) {
    const isDisabled = record.get(`${name}Disabled`);
    const isChecked = record.get(name);
    let checkedRecords;
    if (record.get('treeType') === 'group') {
      checkedRecords = tableDs.find((tableRecord) => record.get('key') === tableRecord.get('sourceId') && tableRecord.get(name) && !tableRecord.get(`${name}Disabled`));
    } else if (record.get('treeType') === 'project') {
      const childrenId = getChildrenId(record.get('key'));
      checkedRecords = tableDs.find((tableRecord) => childrenId.includes(tableRecord.get('sourceId')) && tableRecord.get(name) && !tableRecord.get(`${name}Disabled`));
    }

    return (
      <CheckBox
        record={record}
        name={name}
        checked={isChecked}
        disabled={isDisabled}
        indeterminate={!isChecked && !!checkedRecords}
        onChange={(checkBoxValue) => handleCheckBoxChange(record, checkBoxValue, name)}
      />
    );
  }

  function renderEditor(record, name) {
    return !record.get(`${name}Disabled`);
  }

  return (
    <TabPage className={`${prefixCls}-page`}>
      <Breadcrumb />
      <Prompt message={promptMsg} wrapper="c7n-iam-confirm-modal" when={tableDs.dirty} />
      <Content className={`${prefixCls}-content`}>
        <Table loading={receiveStore.getSpinning} dataSet={tableDs} mode="tree">
          <Column name="name" tooltip="overflow" />
          <Column name="organizationName" />
          <Column
            header={(dataSet) => renderCheckBoxHeader(dataSet, 'pm')}
            renderer={({ record }) => renderCheckBox({ record, name: 'pm' })}
            align="left"
            editor={(record) => renderEditor(record, 'pm')}
          />
          <Column
            header={(dataSet) => renderCheckBoxHeader(dataSet, 'email')}
            renderer={({ record }) => renderCheckBox({ record, name: 'email' })}
            align="left"
            editor={(record) => renderEditor(record, 'email')}
          />
        </Table>
        <Pagination
          className={`${prefixCls}-pagination`}
          total={receiveStore.getPagination.total}
          pageSize={5}
          page={receiveStore.getPagination.page}
          showSizeChanger={false}
          onChange={(data) => {
            if (tableDs.dirty) {
              message.error('当前页有修改，请先保存再操作');
              receiveStore.setPagination({
                page: data - 1,
                total: receiveStore.getPagination.total,
              });
            } else {
              receiveStore.setPagination({
                page: data,
                total: receiveStore.getPagination.total,
              });
              tableDs.loadData(receiveStore.formatData());
            }
          }}
        />
        <div className={`${prefixCls}-buttons`}>
          <Button
            funcType="raised"
            onClick={refresh}
            style={{ marginLeft: 16, color: '#3F51B5' }}
          >
            {formatCommon({ id: 'cancel' })}
          </Button>
          <Button
            funcType="raised"
            color="primary"
            onClick={saveSettings}
          >
            {formatCommon({ id: 'save' })}
          </Button>
        </div>
      </Content>
    </TabPage>
  );
});
