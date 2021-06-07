import React from 'react';
import {
  Permission,
  axios,
  Content,
  TabPage,
  Breadcrumb,
  Action,
  Choerodon,
} from '@choerodon/boot';
import { StatusTag } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import { Table, Tooltip, Modal } from 'choerodon-ui/pro';
import { FormattedMessage } from 'react-intl';
import { useMsgRecordStore } from './stores';
import { useStore } from '../stores';
import MsgDetail from './components/msg-details';

const { Column } = Table;

const detailKey = Modal.key();

function MsgEmail(props) {
  const {
    AppState, intl, ENABLED_GREEN, DISABLED_GRAY,
  } = useStore();

  const {
    msgRecordDataSet,
    permissions,
  } = useMsgRecordStore();

  // 重发
  function retry(record) {
    return axios({
      url: `/hmsg/v1/messages/resend?transactionId=${record.get('transactionId')}`,
      method: 'post',
    })
      .then((data) => {
        let msg = intl.formatMessage({ id: 'msgrecord.send.success' });
        if (data.failed) {
          msg = data.message;
        }
        Choerodon.prompt(msg);
        msgRecordDataSet.query();
      })
      .catch(() => {
        Choerodon.prompt(intl.formatMessage({ id: 'msgrecord.send.failed' }));
      });
  }

  const StatusCard = ({ value }) => (
    <StatusTag
      name={value || intl.formatMessage({ id: 'success' })}
      colorCode={value !== '失败' ? 'success' : 'error'}
    />
  );

  function opendModalDetail(record) {
    Modal.open({
      key: detailKey,
      children: (
        <MsgDetail
          msgId={`${record.get('id')}`}
        />
      ),
      title: <FormattedMessage id="msgrecord.details" />,
      okCancel: false,
      okText: <FormattedMessage id="close" />,
      drawer: true,
      style: {
        width: 'calc(100% - 3.5rem)',
      },
    });
  }

  const actionRenderer = ({ value, record }) => {
    const actionArr = [
      {
        service: [],
        text: <FormattedMessage id="msgrecord.details" />,
        action: () => opendModalDetail(record),
      },
      {
        service: ['choerodon.code.site.manager.message-log.ps.retry-email'],
        text: <FormattedMessage id="msgrecord.resend" />,
        action: () => retry(record),
      },
    ];
    return (
      ['S', 'F'].includes(record.get('statusCode')) && (
        <Action className="action-icon" data={actionArr} />
      )
    );
  };

  const renderEmail = ({ value }) => (
    <Tooltip title={value} placement="topLeft">
      {value}
    </Tooltip>
  );

  const renderFailedReason = ({ value }) => (
    <Tooltip
      placement="bottom"
      title={(
        <p className="c7ncd-notify-page-content-tooltip">{value}</p>
    )}
    >
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
            className="c7ncd-notify-page-content"
          >
            <Table dataSet={msgRecordDataSet} style={{ paddingTop: 0 }}>
              <Column align="left" name="messageName" renderer={renderEmail} width={150} />
              <Column renderer={actionRenderer} width={60} />
              <Column
                align="left"
                width={100}
                name="statusMeaning"
                renderer={StatusCard}
              />
              <Column
                name="failedReason"
                renderer={renderFailedReason}
              />
              <Column name="creationDate" />
            </Table>
          </Content>
        </Permission>
      </TabPage>
    );
  }
  return render();
}

export default observer(MsgEmail);
