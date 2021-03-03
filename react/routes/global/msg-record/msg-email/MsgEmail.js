import React from 'react';
import {
  Permission, StatusTag, axios, Content, TabPage, Breadcrumb, Action, Choerodon,
} from '@choerodon/boot';
import { observer } from 'mobx-react-lite';
import { Table, Tooltip } from 'choerodon-ui/pro';
import { FormattedMessage } from 'react-intl';
import { useMsgRecordStore } from './stores';
import { useStore } from '../stores';

const { Column } = Table;
function MsgEmail(props) {
  const {
    AppState,
    intl,
    ENABLED_GREEN,
    DISABLED_GRAY,
  } = useStore();

  const {
    msgRecordDataSet,
    permissions,
  } = useMsgRecordStore();

  // 重发
  function retry(record) {
    return axios({
      url: `/hmsg/v1/messages/resend?transactionId=${record.get('id')}`,
      method: 'post',
    }).then((data) => {
      let msg = intl.formatMessage({ id: 'msgrecord.send.success' });
      if (data.failed) {
        msg = data.message;
      }
      Choerodon.prompt(msg);
      msgRecordDataSet.query();
    }).catch(() => {
      Choerodon.prompt(intl.formatMessage({ id: 'msgrecord.send.failed' }));
    });
  }
  const StatusCard = ({ value }) => (
    <StatusTag
      name={value || intl.formatMessage({ id: 'success' })}
      color={value !== '失败' ? ENABLED_GREEN : DISABLED_GRAY}
    />
  );

  const actionRenderer = ({ value, record }) => {
    const actionArr = [{
      service: ['choerodon.code.site.manager.message-log.ps.retry-email'],
      text: <FormattedMessage id="msgrecord.resend" />,
      action: () => retry(record),
    }];
    return ['S', 'F'].includes(record.get('statusCode')) && <Action className="action-icon" data={actionArr} />;
  };

  const renderEmail = ({ value }) => (
    <Tooltip title={value} placement="topLeft">
      {value}
    </Tooltip>
  );

  function render() {
    return (
      <TabPage>
        <Breadcrumb />
        <Permission service={permissions}>
          <Content
            values={{ name: AppState.getSiteInfo.systemName || 'Choerodon' }}
            style={{ paddingTop: 0 }}
          >
            <Table dataSet={msgRecordDataSet} style={{ paddingTop: 0 }}>
              <Column align="left" name="email" renderer={renderEmail} />
              <Column renderer={actionRenderer} width={48} />
              <Column
                align="left"
                width={100}
                name="statusMeaning"
                renderer={StatusCard}
              />
              <Column name="messageName" tooltip="overflow" />
              <Column name="failedReason" tooltip="overflow" />
              {/* <Column width={100} align="left" name="retryCount" /> */}
              <Column name="creationDate" width={160} />
            </Table>
          </Content>
        </Permission>
      </TabPage>
    );
  }
  return render();
}

export default observer(MsgEmail);
