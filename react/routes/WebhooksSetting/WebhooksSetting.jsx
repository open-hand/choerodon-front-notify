import React, { useContext } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import { message, Tooltip } from 'choerodon-ui';
import { axios, Breadcrumb, Header, Content, StatusTag, Action, Page } from '@choerodon/boot';
import CreateAndEditWebhooksForm from './CreateAndEditWebhooksForm';
import WebhookRecord from './WebhookRecord';
import Store from './Store';

import './index.less';

const ModalKey = Modal.key();
const { Column } = Table;

const WebhooksSetting = () => {
  const {
    webhooksSettingUseStore,
    projectId,
    webhookRecordTableDataSet,
    webhooksDataSet,
    createWebhooksFormDataSet,
    createTriggerEventsSettingDataSet,
    editWebhooksFormDataSet,
    editTriggerEventsSettingDataSet,
    webhooksTypeMap,
    ENABLED_GREEN,
    DISABLED_GRAY,
    prefixCls,
    AppState: { currentMenuType: { type, id, orgId } },
  } = useContext(Store);

  const handleCreateWebhooks = () => {
    Modal.open({
      title: '添加Webhook',
      key: ModalKey,
      drawer: true,
      style: {
        width: '51.39%',
      },
      okText: '创建',
      children: (
        <CreateAndEditWebhooksForm dataSet={createWebhooksFormDataSet} triggerEventsSettingDataSet={createTriggerEventsSettingDataSet} />
      ),
      onOk: async () => {
        try {
          const res = await axios.post(`/notify/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks`, {
            ...createWebhooksFormDataSet.toJSONData()[0],
            sendSettingIdList: createTriggerEventsSettingDataSet.toJSONData(true).filter((item) => !!item.categoryCode).map(item => item.id),
          });
          if (!res) {
            throw new Error();
          }
          if (res.failed) {
            message.error(res.message);
            throw new Error();
          }
          message.success('提交成功');
          webhooksDataSet.query();
          return true;
        } catch (e) {
          return false;
        }
      },
      afterClose: () => createWebhooksFormDataSet.reset(),
    });
  };

  const editWebhooks = (record) => {
    editWebhooksFormDataSet.queryUrl = `/notify/v1/projects/${projectId}/web_hooks/${record.get('id')}`;
    editWebhooksFormDataSet.query();
    Modal.open({
      title: '编辑Webhook',
      key: ModalKey,
      drawer: true,
      okText: '保存',
      style: {
        width: 740,
      },
      onOk: async () => {
        try {
          const res = await axios.put(`/notify/v1/projects/${projectId}/web_hooks/${record.get('id')}`, {
            ...editWebhooksFormDataSet.toData()[0],
            sendSettingIdList: editTriggerEventsSettingDataSet.toJSONData(true).filter((item) => !!item.categoryCode).map(item => item.id),
            triggerEventSelection: undefined,
          });
          if (!res) {
            throw new Error();
          }
          if (res.failed) {
            message.error(res.message);
            throw new Error();
          }
          message.success('提交成功');
          webhooksDataSet.query();
          return true;
        } catch (e) {
          return false;
        }
      },
      children: (
        <CreateAndEditWebhooksForm dataSet={editWebhooksFormDataSet} triggerEventsSettingDataSet={editTriggerEventsSettingDataSet} />
      ),
      afterClose: () => editWebhooksFormDataSet.reset(),
    });
  };

  const deleteWebhooks = (record) => webhooksDataSet.delete(record).then((res) => {
    webhooksDataSet.query();
  });

  const toggleWebhooks = async (record) => {
    try {
      const res = await axios.put(`notify/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks/${record.get('id')}/${record.get('enableFlag') ? 'disabled' : 'enabled'}`);
      if (res.failed) {
        message(res.message);
        throw Error();
      }
      if (!res) {
        throw Error(res);
      }
      webhooksDataSet.query();
    } catch (e) {
      return false;
    }
  };

  const NameRenderer = ({ record }) => (
    <Tooltip placement="top" title={record.get('name')}>
      <p onClick={() => editWebhooks(record)}>{record.get('name')}</p>
    </Tooltip>
  );

  const ActionRenderer = ({ record }) => {
    const actionArr = [{
      service: [],
      text: record.get('enableFlag') ? '停用' : '启用',
      action: () => toggleWebhooks(record),
    }, {
      service: [],
      text: '删除',
      action: () => deleteWebhooks(record),
    }, {
      service: [],
      text: '查看执行记录',
      action: () => Modal.open({
        title: 'Webhook执行记录',
        key: Modal.key(),
        drawer: true,
        style: {
          width: 900,
        },
        okCancel: false,
        okText: '取消',
        children: <WebhookRecord webhookId={record.get('id')} ds={webhookRecordTableDataSet} type={type} id={id} orgId={orgId} useStore={webhooksSettingUseStore} />,
      }),
    }];
    return <Action className="action-icon" data={actionArr} />;
  };

  const StatusRenderer = ({ value }) => <StatusTag name={value ? '启用' : '停用'} color={value ? ENABLED_GREEN : DISABLED_GRAY} />;

  const typeRenderer = ({ value }) => webhooksTypeMap[value];

  return (
    <Page>
      <Header>
        <Button icon="playlist_add" onClick={handleCreateWebhooks}>创建Webhooks</Button>
      </Header>
      <Breadcrumb />
      <Content className={`${prefixCls}-content`}>
        <Table dataSet={webhooksDataSet}>
          <Column
            name="name"
            renderer={NameRenderer}
            // onCell={({ record }) => ({
            //   onClick: () => editWebhooks(record),
            // })}
          />
          <Column renderer={ActionRenderer} width={48} />
          <Column name="webhookPath" />
          <Column name="type" renderer={typeRenderer} />
          <Column name="enableFlag" renderer={StatusRenderer} />
        </Table>
      </Content>
    </Page>
  );
};

export default WebhooksSetting;
