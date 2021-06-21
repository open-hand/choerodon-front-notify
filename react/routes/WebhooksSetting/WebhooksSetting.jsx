import React, {
  useContext, useState, useRef, useCallback, useEffect,
} from 'react';
import {
  Table, Button, Modal, Output,
} from 'choerodon-ui/pro';
import {
  message, Popover, Icon, Tag,
} from 'choerodon-ui';
import { useMeasure } from 'react-use';
import {
  axios, Breadcrumb, Header, Content, Action, Page, Permission,
} from '@choerodon/boot';
import { StatusTag } from '@choerodon/components';
import { HeaderButtons } from '@choerodon/master';
import CreateAndEditWebhooksForm from './CreateAndEditWebhooksForm';
import WebhookRecord from './WebhookRecord';
import Store from './Store';

import './index.less';

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
    Services,
  } = useContext(Store);

  const [ref, { width }] = useMeasure();

  const handleCreateWebhooks = () => {
    Modal.open({
      title: '添加Webhook',
      key: Modal.key(),
      drawer: true,
      style: {
        width: '51.39%',
      },
      okText: '创建',
      children: (
        <CreateAndEditWebhooksForm
          dataSet={createWebhooksFormDataSet}
          triggerEventsSettingDataSet={createTriggerEventsSettingDataSet}
          useStore={webhooksSettingUseStore}
        />
      ),
      onOk: async () => {
        try {
          const res = await axios.post(`/hmsg/choerodon/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks`, {
            ...createWebhooksFormDataSet.toJSONData()[0],
            sendSettingIdList: createTriggerEventsSettingDataSet.toJSONData(true)
              .filter((item) => !!item.categoryCode).map((item) => item.id),
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

  const editWebhooks = async (record) => {
    editWebhooksFormDataSet.queryUrl = `/hmsg/choerodon/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks/${record.get('serverId')}/record`;
    await editWebhooksFormDataSet.query();
    Modal.open({
      title: '编辑Webhook',
      key: Modal.key(),
      drawer: true,
      okText: '保存',
      style: {
        width: 740,
      },
      onOk: async () => {
        try {
          const res = await axios.put(`/hmsg/choerodon/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks/${record.get('serverId')}`, {
            ...editWebhooksFormDataSet.toData()[0],
            sendSettingIdList: editTriggerEventsSettingDataSet.toJSONData(true)
              .filter((item) => !!item.categoryCode).map((item) => item.id),
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
        <CreateAndEditWebhooksForm
          dataSet={editWebhooksFormDataSet}
          triggerEventsSettingDataSet={editTriggerEventsSettingDataSet}
          useStore={webhooksSettingUseStore}
          isEdit
        />
      ),
      afterClose: () => {
        editWebhooksFormDataSet.reset();
      },
    });
  };

  const deleteWebhooks = async (record) => {
    const modalProps = {
      title: '删除Webhook',
      children: '确定删除该条Webhook吗？',
      okText: '删除',
      okProps: { color: 'red' },
      cancelProps: { color: 'dark' },
    };
    const res = await webhooksDataSet.delete(record, modalProps);
    if (res && res.success) {
      webhooksDataSet.query();
    }
  };

  const handleToggleWebhooks = async (record) => {
    try {
      const res = await axios.put(`hmsg/choerodon/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks/${record.get('serverId')}/update_status?enable_flag=${record.get('enabledFlag') ? 0 : 1}`, JSON.stringify());
      if (res && res.failed) {
        return false;
      }
      webhooksDataSet.query();
      return true;
    } catch (e) {
      return false;
    }
  };

  // eslint-disable-next-line consistent-return
  const toggleWebhooks = async (record) => {
    if (record.get('enabledFlag')) {
      Modal.confirm({
        title: '停用WebHook',
        children: `确定${record.get('enabledFlag') ? '停用' : '启用'}该WebHook吗？`,
        onOk: () => handleToggleWebhooks(record),
        // eslint-disable-next-line consistent-return
      });
    } else {
      handleToggleWebhooks(record);
    }
  };

  useEffect(() => {
    const items = document.getElementsByClassName('webhook_nameRenderContent');
    if (items.length && items.length > 0) {
      items.forEach((i, iIndex) => {
        if (i.scrollWidth > i.clientWidth) {
          webhooksDataSet.records[iIndex].set('isScrolling', true);
        }
      });
    }
  }, [width]);

  // eslint-disable-next-line consistent-return
  const popoverCotent = (record) => {
    if (record && record.get('name')) {
      return (
        <div style={{ width: 360, display: 'flex', flexWrap: 'wrap' }}>
          {record.get('name').split(',').map((r) => (
            <StatusTag
              name={r}
              style={{
                marginLeft: 8,
              }}
            />
          ))}
        </div>
      );
    }
  };

  const NameRenderer = ({ record }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
      // onClick={() => editWebhooks(record)}
    >
      <div
        className="webhook_nameRenderContent"
        ref={ref}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <Output
          multiple
          value={record.get('name').split(',')}
        />
      </div>
      <Popover placement="bottom" content={popoverCotent(record)}>
        <Icon
          style={{
            marginLeft: 8,
            display: record.get('isScrolling') ? 'block' : 'none',
          }}
          type="expand_more"
        />
      </Popover>
    </div>
  );

  const handleAllWebhookRecord = async (webhookId) => {
    const res = await axios.get('/hpfm/v1/lovs/value?lovCode=HMSG.TRANSACTION_STATUS');
    webhooksSettingUseStore.setStatusList(res);
    Modal.open({
      title: 'Webhook执行记录',
      key: Modal.key(),
      drawer: true,
      okText: '关闭',
      okCancel: false,
      style: {
        width: 900,
      },
      children: <WebhookRecord
        ds={webhookRecordTableDataSet}
        type={type}
        id={id}
        orgId={orgId}
        useStore={webhooksSettingUseStore}
        Services={Services}
        webhookId={webhookId}
      />,
    });
  };

  const ActionRenderer = ({ record }) => {
    const actionArr = [{
      service: Services.editService,
      text: '修改',
      action: () => {
        editWebhooks(record);
      },
    }, {
      service: Services.enableService,
      text: record.get('enabledFlag') ? '停用' : '启用',
      action: () => toggleWebhooks(record),
    }, {
      service: Services.deleteService,
      text: '删除',
      action: () => deleteWebhooks(record),
    }, {
      service: Services.recordService,
      text: '查看执行记录',
      action: () => handleAllWebhookRecord(record.get('serverId')),
    }];
    return <Action className="action-icon" data={actionArr} />;
  };

  const StatusRenderer = ({ value }) => <StatusTag name={value ? '启用' : '停用'} color={value ? ENABLED_GREEN : DISABLED_GRAY} />;

  const typeRenderer = ({ value }) => <span>{webhooksTypeMap[value]}</span>;

  return (
    <Page
      service={Services.pageService}
    >
      <Header>
        <HeaderButtons items={[{
          name: '创建Webhooks',
          icon: 'playlist_add',
          display: true,
          permissions: Services.createService,
          handler: handleCreateWebhooks,
        }, {
          name: 'Webhook执行记录',
          icon: 'assignment-o',
          display: true,
          permissions: Services.recordService,
          handler: () => handleAllWebhookRecord(false),
        }]}
        />
      </Header>
      <Breadcrumb />
      <Content className={`${prefixCls}-content`}>
        <Table dataSet={webhooksDataSet}>
          <Column
            name="name"
            width="60%"
            renderer={NameRenderer}
            onCell={({ record }) => ({
              onClick: () => editWebhooks(record),
            })}
          />
          <Column renderer={ActionRenderer} width={60} />
          <Column name="webhookAddress" tooltip="overflow" />
          <Column name="serverType" renderer={typeRenderer} />
          <Column
            name="enabledFlag"
            align="left"
            renderer={StatusRenderer}
            width={80}
          />
        </Table>
      </Content>
    </Page>
  );
};

export default WebhooksSetting;
