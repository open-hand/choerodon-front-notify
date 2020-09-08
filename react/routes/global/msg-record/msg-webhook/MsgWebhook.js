import React from 'react';
import { observer } from 'mobx-react-lite';
import { Table } from 'choerodon-ui/pro';
import { Permission } from '@choerodon/boot';
import { FormattedMessage } from 'react-intl';
import { Content, TabPage, Breadcrumb, StatusTag } from '@choerodon/boot';

import { useStore } from '../stores';


const { Column } = Table;
function MsgWebhook() {
  const { AppState, msgWebhookDataSet, ENABLED_GREEN, DISABLED_GRAY } = useStore();

  const StatusCard = ({ value }) => (<StatusTag name={<FormattedMessage id={value} />} color={value !== '失败' ? ENABLED_GREEN : DISABLED_GRAY} />);

  return (
    <TabPage>
      <Breadcrumb />
      <Permission service={['choerodon.code.site.manager.message-log.ps.webhook']}>
        <Content
          values={{ name: AppState.getSiteInfo.systemName || 'Choerodon' }}
          style={{ paddingTop: 0 }}
        >
          <Table dataSet={msgWebhookDataSet}>
            <Column align="left" name="creationDate" />
            <Column
              align="left"
              width={100}
              name="statusMeaning"
              renderer={StatusCard}
            />
            <Column name="failedReason" />
            <Column name="messageName" />
            <Column name="webhookAddress" />
          </Table>
        </Content>
      </Permission>
    </TabPage>
  );
}

export default observer(MsgWebhook);
