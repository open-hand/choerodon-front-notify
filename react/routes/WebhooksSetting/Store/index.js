import React, { createContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import TriggerEventsSettingDataSet from './TriggerEventsSettingDataSet';
import WebhooksDataSet from './WebhooksDataSet';
import WebhookRecordTableDataSet from './WebhookRecordTableDataSet';
import WebhooksFormDataSet from './WebhooksFormDataSet';
import useStore from './useStore';

const Store = createContext();

export default Store;

export const StoreProvider = injectIntl(inject('AppState')(
  (props) => {
    const { AppState: { currentMenuType: { type, id, orgId } }, intl, children } = props;
    const webhooksDataSet = useMemo(() => new DataSet(WebhooksDataSet(id, type, orgId)), []);
    const createTriggerEventsSettingDataSet = useMemo(() => new DataSet(TriggerEventsSettingDataSet('create', id, type, orgId)), []);
    const editTriggerEventsSettingDataSet = useMemo(() => new DataSet(TriggerEventsSettingDataSet('edit', id, type, orgId)), []);
    const editWebhooksFormDataSet = useMemo(() => new DataSet(WebhooksFormDataSet('edit', id, editTriggerEventsSettingDataSet, orgId, type)), []);
    const createWebhooksFormDataSet = useMemo(() => new DataSet(WebhooksFormDataSet('create', id, undefined, orgId, type)), []);
    const webhookRecordTableDataSet = useMemo(() => new DataSet(WebhookRecordTableDataSet(id, type, orgId)), []);
    // const webhookRecordDetailDataSet = useMemo(() => new DataSet(WebhookRecordDetailDataSet()), []);
    const value = {
      webhooksSettingUseStore: useStore(),
      projectId: id,
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
      ...props,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
