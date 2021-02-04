import React, { useEffect } from 'react';
import {
  Form, TextField, TextArea, SelectBox, Table, CheckBox,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

const { Column } = Table;

const CreateAndEditWebhooksForm = observer(({
  dataSet, triggerEventsSettingDataSet, modal, useStore, isEdit = false,
}) => {
  const handleQueryTriggerEvent = async (type) => {
    let typeParams;
    if (type === 'Json') {
      typeParams = 'webHookJson';
    } else {
      typeParams = 'webHookOther';
    }
    triggerEventsSettingDataSet.setQueryParameter('type', typeParams);
    await triggerEventsSettingDataSet.query();
    await dataSet.ready();

    let categoryCodesList = [];
    const children = triggerEventsSettingDataSet;
    if (children) {
      children.forEach((item) => {
        if (item.isSelected) {
          // eslint-disable-next-line no-param-reassign
          item.isSelected = false;
        }
        if (dataSet.current.get('sendSettingIdList') && dataSet.current.get('sendSettingIdList').find((selectId) => selectId === item.get('id'))) {
          // if (item.get('categoryCode')) {
          //   children.find(l => l.get('code') === item.get('categoryCode')).isSelected = true;
          // }
          if (item.get('categoryCode')) {
            categoryCodesList = [...categoryCodesList, item.get('categoryCode')];
          }
          // eslint-disable-next-line no-param-reassign
          item.isSelected = true;
        }
      });
    }
    if (categoryCodesList.length > 0) {
      categoryCodesList.forEach((c) => {
        children.find((l) => l.get('code') === c).isSelected = true;
      });
    }
  };

  useEffect(() => {
    const arr = triggerEventsSettingDataSet.toJSONData(true)
      .filter((item) => !!item.categoryCode).map((item) => item.id);
    modal.update({
      okProps: {
        disabled: !arr || arr.length === 0,
      },
    });
  }, [useStore.getChangeWebhookSetting]);

  useEffect(() => {
    async function init() {
      await handleQueryTriggerEvent(dataSet.current.get('serverType'));
      const arr = triggerEventsSettingDataSet.toJSONData(true)
        .filter((item) => !!item.categoryCode).map((item) => item.id);
      modal.update({
        okProps: {
          disabled: !arr || arr.length === 0,
        },
      });
    }
    init();
  }, []);

  const checkBoxRenderer = ({ value, record }) => {
    const handleNodeChecked = (clicked) => (clicked ? triggerEventsSettingDataSet.select(record)
      : triggerEventsSettingDataSet.unSelect(record));
    return (
      <CheckBox
        checked={record.isSelected}
        onChange={handleNodeChecked}
      />
    );
  };
  const checkBoxHeaderRenderer = () => {
    const handleHeaderChecked = (value) => (value ? triggerEventsSettingDataSet.selectAll()
      : triggerEventsSettingDataSet.unSelectAll());
    return (
      <CheckBox
        checked={triggerEventsSettingDataSet.every((item) => item.isSelected)}
        onChange={handleHeaderChecked}
      />
    );
  };
  return (
    <>
      <Form dataSet={dataSet} style={{ width: '5.12rem' }}>
        <SelectBox
          disabled={isEdit}
          onChange={(value) => handleQueryTriggerEvent(value)}
          name="serverType"
        />
        <TextArea name="webhookAddress" />
        {/* { */}
        {/* (function () { */}
        {/*  if (dataSet.current) { */}
        {/*    if (['DingTalk', 'Json'].includes(dataSet.current.get('type'))) { */}
        {/*      return <TextArea name="secret" />; */}
        {/*    } */}
        {/*  } */}
        {/* }()) */}
        {/* } */}
        {
          dataSet.current
          && ['DingTalk', 'Json'].includes(dataSet.current.get('serverType'))
          && <TextArea name="secret" />
        }
      </Form>
      <div className="c7n-org-webhook-divider" />
      <p
        style={{
          color: 'rgba(0, 0, 0, 0.85)',
          fontWeight: 500,
          fontSize: '0.18rem',
          lineheight: '0.24rem',
        }}
      >
        触发事件设置
      </p>
      <Table dataSet={triggerEventsSettingDataSet} mode="tree">
        <Column name="name" />
        <Column name="description" />
      </Table>
    </>

  );
});

export default CreateAndEditWebhooksForm;
