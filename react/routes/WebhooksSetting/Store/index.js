import React, { createContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { useFormatMessage, useFormatCommon } from '@choerodon/master';
import TriggerEventsSettingDataSet from './TriggerEventsSettingDataSet';
import WebhooksDataSet from './WebhooksDataSet';
import WebhookRecordTableDataSet from './WebhookRecordTableDataSet';
import WebhooksFormDataSet from './WebhooksFormDataSet';
import useStore from './useStore';

const Store = createContext();

export default Store;

export const StoreProvider = inject('AppState')(
  (props) => {
    const { AppState: { currentMenuType: { type, id, orgId } }, children } = props;

    const intlPrefix = 'c7ncd.project.notify';

    const formatProjectNotify = useFormatMessage(intlPrefix);
    const formatCommon = useFormatCommon();

    const webhooksSettingUseStore = useStore();
    const webhooksDataSet = useMemo(() => new DataSet(WebhooksDataSet(id, type, orgId, formatProjectNotify, formatCommon)), []);
    const createTriggerEventsSettingDataSet = useMemo(() => new DataSet(TriggerEventsSettingDataSet('create', id, type, orgId, webhooksSettingUseStore)), []);
    const editTriggerEventsSettingDataSet = useMemo(() => new DataSet(TriggerEventsSettingDataSet('edit', id, type, orgId, webhooksSettingUseStore)), []);
    const editWebhooksFormDataSet = useMemo(() => new DataSet(WebhooksFormDataSet('edit', id, editTriggerEventsSettingDataSet, orgId, type)), [editTriggerEventsSettingDataSet]);
    const createWebhooksFormDataSet = useMemo(() => new DataSet(WebhooksFormDataSet('create', id, undefined, orgId, type)), []);
    const webhookRecordTableDataSet = useMemo(() => new DataSet(
      WebhookRecordTableDataSet(webhooksSettingUseStore, formatProjectNotify, formatCommon),
    ), [webhooksSettingUseStore]);
    const value = {
      projectId: id,
      webhooksSettingUseStore,
      // webhookRecordDetailDataSet,
      webhookRecordTableDataSet,
      webhooksDataSet,
      editWebhooksFormDataSet,
      editTriggerEventsSettingDataSet,
      createWebhooksFormDataSet,
      createTriggerEventsSettingDataSet,
      webhooksTypeMap: {
        WeChat: '企业微信',
        DingTalk: '钉钉',
        Json: 'JSON',
      },
      ENABLED_GREEN: 'rgba(0, 191, 165, 1)',
      DISABLED_GRAY: 'rgba(0, 0, 0, 0.2)',
      prefixCls: 'webhook-setting',
      Services: type === 'organization' ? {
        pageService: ['choerodon.code.organization.setting.webhooks-setting.ps.default'],
        createService: ['choerodon.code.organization.setting.webhooks-setting.ps.create'],
        recordService: ['choerodon.code.organization.setting.webhooks-setting.ps.records'],
        editService: ['choerodon.code.organization.setting.webhooks-setting.ps.edit'],
        deleteService: ['choerodon.code.organization.setting.webhooks-setting.ps.delete'],
        enableService: ['choerodon.code.organization.setting.webhooks-setting.ps.enable'],
        retryService: ['choerodon.code.organization.setting.webhooks-setting.ps.retry-webhook'],
      } : {
        pageService: ['choerodon.code.project.setting.setting-notify.ps.webhook'],
        createService: ['choerodon.code.project.setting.setting-notify.ps.webhook.create'],
        recordService: ['choerodon.code.project.setting.setting-notify.ps.webhook.logs'],
        editService: ['choerodon.code.project.setting.setting-notify.ps.webhook.edit'],
        deleteService: ['choerodon.code.project.setting.setting-notify.ps.webhook.delete'],
        enableService: ['choerodon.code.project.setting.setting-notify.ps.webhook.enable'],
        retryService: ['choerodon.code.project.setting.setting-notify.ps.webhook.retry'],
      },
      ...props,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
);
