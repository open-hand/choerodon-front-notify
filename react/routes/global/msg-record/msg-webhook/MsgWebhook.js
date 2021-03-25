import React from 'react';
import { observer } from 'mobx-react-lite';
import { Table } from 'choerodon-ui/pro';
import {
  Permission, Content, TabPage, Breadcrumb, StatusTag,
} from '@choerodon/boot';
import { useWebhookRecordStore } from './stores';
import { useStore } from '../stores';

const { Column } = Table;

function MsgWebhook() {
  const {
    AppState,
    ENABLED_GREEN,
    DISABLED_GRAY,
    intl: { formatMessage },
  } = useStore();

  const {
    msgWebhookDataSet,
    permissions,
  } = useWebhookRecordStore();

  const StatusCard = ({ value }) => (
    <StatusTag
      name={value || formatMessage({ id: 'success' })}
      color={value !== '失败' ? ENABLED_GREEN : DISABLED_GRAY}
    />
  );

  return (
    <TabPage>
      <Breadcrumb />
      <Permission service={permissions}>
        <Content
          values={{ name: AppState.getSiteInfo.systemName || 'Choerodon' }}
          className="c7ncd-notify-page-content"
        >
          <Table dataSet={msgWebhookDataSet}>
            <Column align="left" name="creationDate" width={160} />
            <Column
              align="left"
              width={100}
              name="statusMeaning"
              renderer={StatusCard}
            />
            <Column name="failedReason" tooltip="overflow" />
            <Column name="messageName" />
            <Column name="webhookAddress" tooltip="overflow" />
          </Table>
        </Content>
      </Permission>
    </TabPage>
  );
}

export default observer(MsgWebhook);
