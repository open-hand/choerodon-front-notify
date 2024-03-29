import React, { useContext } from 'react';
import {
  Table, Form, Output, Spin, Icon, Tooltip,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Tabs } from 'choerodon-ui';
import { NewTips } from '@choerodon/components';
import {
  Action, axios, Content, StatusTag, PageTab, PageWrap,
} from '@choerodon/boot';
import Store from '../Store';
import ShadowView from './ShadowView';

import './MessageTypeDetail.less';

const cssPrefix = 'c7n-notify-messageTypeDetail';

const { Column } = Table;
const { TabPane } = Tabs;

const MessageTypeDetail = observer(() => {
  const { messageTypeDetailDataSet, templateDataSet } = useContext(Store);
  const { current } = messageTypeDetailDataSet;

  const sentTypeRenderer = ({ record }) => {
    const ret = [];
    if (record.getPristineValue('emailEnabledFlag')) {
      ret.push('邮件');
    }
    if (record.getPristineValue('pmEnabledFlag')) {
      ret.push('站内信');
    }
    if (record.getPristineValue('smsEnabledFlag')) {
      ret.push('短信');
    }
    if (record.getPristineValue('webhookEnabledFlag')) {
      ret.push('webhook');
    }
    if (record.getPristineValue('dtEnabledFlag')) {
      ret.push('钉钉');
    }

    return ret.length > 0 ? ret.join('、') : '无';
  };

  const yesOrNoRenderer = ({ value }) => (value ? '是' : '否');
  const TemplateForm = ({ record, showTheme }) => (record ? (
    <>
      {showTheme && (
        <div style={{ fontSize: '0.14rem' }}>
          <span style={{ marginRight: '1.7rem', color: 'var(--text-color3)' }}>发送主题</span>
          <span>{record.getPristineValue('templateTitle')}</span>
        </div>
      )}
      <p style={{
        marginTop: '0.16rem', marginBottom: '0.08rem', fontSize: '0.14rem', color: 'var(--text-color3)',
      }}
      >
        预览
      </p>
      <div className={`${cssPrefix}-htmlContainer`}>
        <ShadowView>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: record.getPristineValue('templateContent') }} style={{ marginBottom: '.2rem' }} />
        </ShadowView>
      </div>
    </>
  ) : <div>无</div>);
  const getIcon = (type) => {
    if (!messageTypeDetailDataSet.current.get(`${type}EnabledFlag`)) {
      return (
        <Tooltip title="该模板未启用，请在发送设置中选择">
          <Icon type="error" style={{ color: '#FFB100' }} />
        </Tooltip>
      );
    }
    return null;
  };
  const TipList = { webhook: '模板内容将决定后续通过webhook在钉钉端或企业微信端接收的消息内容', dt: '模板内容将决定后续在钉钉端或企业微信端接收的消息内容' };
  return current ? (
    <div className={cssPrefix}>
      <header className={`${cssPrefix}-header`}>
        <span
          className={`${cssPrefix}-header-circle`}
          style={{ backgroundColor: current.getPristineValue('enabledFlag') ? '#00BFA5' : 'rgba(0,0,0,0.20)' }}
        />
        <span className={`${cssPrefix}-header-name`}>{current.getPristineValue('messageName')}</span>
      </header>
      <Form pristine header="发送设置" className={`${cssPrefix}-form`} dataSet={messageTypeDetailDataSet} labelLayout="horizontal" labelAlign="left" labelWidth={225}>
        <Output label="发送方式" renderer={sentTypeRenderer} />
        <Output name="receiveConfigFlag" renderer={yesOrNoRenderer} />
        {/* <Output name="isSendInstantly" renderer={yesOrNoRenderer} /> */}
        <Output name="retryCount" />
        {/* <Output name="isManualRetry" renderer={yesOrNoRenderer} /> */}
        {/* <Output name="backlogFlag" renderer={yesOrNoRenderer} /> */}
      </Form>
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={(
            <div className={`${cssPrefix}-tab-container`}>
              邮件模板
              {getIcon('email')}
            </div>
)}
          key="1"
        >
          <TemplateForm record={templateDataSet.find((item) => item.getPristineValue('sendingType') === 'EMAIL')} showTheme />
        </TabPane>
        <TabPane
          tab={(
            <div className={`${cssPrefix}-tab-container`}>
              站内信模板
              {getIcon('pm')}
            </div>
)}
          key="2"
        >
          <TemplateForm record={templateDataSet.find((item) => item.getPristineValue('sendingType') === 'WEB')} showTheme />
        </TabPane>
        <TabPane
          tab={(
            <div className={`${cssPrefix}-tab-container`}>
              webhook-JSON模板
              {getIcon('webhookJson')}
            </div>
)}
          key="3"
        >
          <TemplateForm record={templateDataSet.find((item) => item.getPristineValue('sendingType') === 'WEB_HOOK' && item.getPristineValue('templateCode').includes('JSON'))} showTheme />
        </TabPane>
        <TabPane
          tab={(
            <div className={`${cssPrefix}-tab-container`}>
              webhook-钉钉微信模板
              {getIcon('webhook')}
              <NewTips helpText={TipList.webhook} className={`${cssPrefix}-tab-container-tip`} />
            </div>
)}
          key="4"
        >
          <TemplateForm record={templateDataSet.find((item) => item.getPristineValue('sendingType') === 'WEB_HOOK' && item.getPristineValue('templateCode').includes('DINGTALKANDWECHAT'))} showTheme />
        </TabPane>
        <TabPane
          tab={(
            <div className={`${cssPrefix}-tab-container`}>
              短信模板
              {getIcon('sms')}
            </div>
)}
          key="5"
        >
          <TemplateForm record={templateDataSet.find((item) => item.getPristineValue('sendingType') === 'SMS')} />
        </TabPane>
        <TabPane
          tab={(
            <div className={`${cssPrefix}-tab-container`}>
              钉钉企微模板
              {getIcon('dt')}
              <NewTips helpText={TipList.dt} className={`${cssPrefix}-tab-container-tip`} />
            </div>
)}
          key="6"
        >
          <TemplateForm record={templateDataSet.find((item) => item.getPristineValue('sendingType') === 'DT')} showTheme />
        </TabPane>

      </Tabs>
    </div>
  ) : <Spin />;
});

export default MessageTypeDetail;
