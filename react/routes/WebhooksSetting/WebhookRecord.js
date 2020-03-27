import React, { useContext, useEffect } from 'react';
import { Table, Modal } from 'choerodon-ui/pro';
import { Action, StatusTag } from '@choerodon/boot';
import WebhookRecordDetail from './WebhookRecordDetail';

const { Column } = Table;

const WebhookRecord = ({ webhookId, ds, type, id, orgId, useStore }) => {
  useEffect(() => {
    ds.queryUrl = `notify/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hook_records${webhookId ? `?webhook_id=${webhookId}` : ''}`;
    // ds.setQueryParameter('webhookId', webhookId);

    ds.query();
  }, []);

  const handleAction = async (record) => {
    if (record.get('status') === 'RUNNING') {
      try {
        await useStore.handleForceFailure(type, id, orgId, record.get('id'));
        ds.query();
      } catch (e) {
        window.console.log(e);
      }
    } else {
      try {
        await useStore.handleRetryRecord(type, id, orgId, record.get('id'));
        ds.query();
      } catch (e) {
        window.console.log(e);
      }
    }
  };

  const ActionRenderer = ({ record }) => {
    const actionArr = [{
      service: [],
      text: record.get('status') === 'RUNNING' ? '强制失败' : '重新执行',
      action: () => handleAction(record),
    }];
    return <Action className="action-icon" data={actionArr} />;
  };

  const statusRenderer = ({ record, value }) => {
    const statusKeyValue = {
      COMPLETED: {
        name: '成功',
        color: 'rgba(0, 191, 165, 1)',
      },
      FAILED: {
        name: '失败',
        color: 'rgb(241, 111, 127)',
      },
      RUNNING: {
        name: '执行中',
        color: 'rgb(22, 183, 149)',
      },
    };
    return <StatusTag name={statusKeyValue[value].name} color={statusKeyValue[value].color} />;
  };

  const handleClickName = (record) => {
    Modal.open({
      title: 'Webhook记录详情',
      key: Modal.key(),
      drawer: true,
      okText: '关闭',
      okCancel: false,
      style: {
        width: 740,
      },
      children: <WebhookRecordDetail recordId={record.get('id')} type={type} id={id} orgId={orgId} useStore={useStore} />,
    });
  };

  const nameRender = ({ record, value }) => <p className="webhookRecord_table_name" onClick={() => handleClickName(record)}>{value}</p>;


  return (
    <Table
      dataSet={ds}
      queryBar="advancedBar"
      queryFieldsLimit={3}
    >
      <Column name="name" renderer={nameRender} />
      <Column renderer={ActionRenderer} width={48} />
      <Column name="webhookPath" />
      <Column name="status" renderer={statusRenderer} />
      <Column name="type" />
      <Column name="sendTime" />
    </Table>
  );
};

export default WebhookRecord;
