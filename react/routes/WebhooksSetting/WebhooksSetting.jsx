import React, { useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import { message, Popover, Icon } from 'choerodon-ui';
import { useMeasure } from 'react-use';
import { axios, Breadcrumb, Header, Content, StatusTag, Action, Page, Permission } from '@choerodon/boot';
import CreateAndEditWebhooksForm from './CreateAndEditWebhooksForm';
import WebhookRecord from './WebhookRecord';
import Store from './Store';

import './index.less';

const { Column } = Table;

const Services = {
  pageService: '',
  createService: '',
  recordService: '',
};

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

  useEffect(() => {
    if (type === 'organization') {
      Services.pageService = 'choerodon.code.organization.setting.webhooks-setting.ps.default';
      Services.createService = 'choerodon.code.organization.setting.webhooks-setting.ps.create';
      Services.recordService = 'choerodon.code.organization.setting.webhooks-setting.ps.records';
    }
  }, []);

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
        <CreateAndEditWebhooksForm dataSet={createWebhooksFormDataSet} triggerEventsSettingDataSet={createTriggerEventsSettingDataSet} />
      ),
      onOk: async () => {
        try {
          const res = await axios.post(`/hmsg/choerodon/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks`, {
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
      afterClose: () => {
        editWebhooksFormDataSet.reset();
      },
    });
  };

  const deleteWebhooks = (record) => webhooksDataSet.delete(record).then((res) => {
    webhooksDataSet.query();
  });

  const toggleWebhooks = async (record) => {
    try {
      const res = await axios.put(`hmsg/choerodon/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks/${record.get('id')}/update_status?enable_flag=${record.get('enableFlag') ? 'false' : 'true'}`, JSON.stringify());
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

  const popoverCotent = (record) => {
    if (record && record.get('name')) {
      return (
        <div style={{ width: 360, display: 'flex', flexWrap: 'wrap' }}>
          {record.get('name').split(',').map(r => (
            <span
              className="webhook_nameRenderSpan"
              style={{
                background: 'rgba(0, 0, 0, 0.08)',
                borderRadius: 10,
                padding: '0 8px 0 8px',
                marginLeft: '8px',
                marginTop: '8px',
              }}
            >{r}
            </span>
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
        {
            record.get('name').split(',').map(r => (
              <span
                className="webhook_nameRenderSpan"
                style={{
                  background: 'rgba(0, 0, 0, 0.08)',
                  borderRadius: 10,
                  padding: '0 8px 0 8px',
                  marginLeft: '8px',
                  fontSize: '12px',
                  fontFamily: 'PingFangSC-Regular, PingFang SC',
                  fontWeight: 400,
                  color: 'rgba(0, 0, 0, 1)',
                  lineHeight: '20px',
                  display: 'inline-block',
                }}
              >{r}
              </span>
            ))
          }
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

  const handleAllWebhookRecord = () => {
    Modal.open({
      title: 'Webhook执行记录',
      key: Modal.key(),
      drawer: true,
      okText: '关闭',
      okCancel: false,
      style: {
        width: 900,
      },
      children: <WebhookRecord ds={webhookRecordTableDataSet} type={type} id={id} orgId={orgId} useStore={webhooksSettingUseStore} />,
    });
  };

  const ActionRenderer = ({ record }) => {
    const actionArr = [{
      service: [],
      text: '修改',
      action: () => {
        editWebhooks(record);
      },
    }, {
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

  const typeRenderer = ({ value }) => <span className="webhookRecord_cantLinkText">{webhooksTypeMap[value]}</span>;
  const PathRenderer = ({ value }) => (
    <Popover content={value} placement="top">
      <span className="webhookRecord_cantLinkText">{value}</span>
    </Popover>
  );

  return (
    <Page
      service={[Services.pageService]}
    >
      <Header>
        <Permission service={[Services.createService]}>
          <Button icon="playlist_add" onClick={handleCreateWebhooks}>创建Webhooks</Button>
        </Permission>
        <Permission
          service={[Services.recordService]}
        >
          <Button icon="assignment" onClick={handleAllWebhookRecord}>Webhook执行记录</Button>
        </Permission>
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
          <Column renderer={ActionRenderer} width={48} />
          <Column name="webhookAddress" renderer={PathRenderer} />
          <Column name="serverType" renderer={typeRenderer} />
          <Column name="enableFlag" renderer={StatusRenderer} />
        </Table>
      </Content>
    </Page>
  );
};

export default WebhooksSetting;
