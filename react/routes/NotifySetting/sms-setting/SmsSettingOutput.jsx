import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Output, Spin, Modal, Button,
} from 'choerodon-ui/pro';
import {
  axios, Content, Header, Page, Permission, Breadcrumb,
} from '@choerodon/boot';
import { HeaderButtons } from '@choerodon/master';
import store from '../Store';
import './SmsSetting.scss';
import SmsSettingForm from './SmsSettingForm';

const OutputEmptyValue = ({ value }) => (value ? <span>{value}</span> : <span>无</span>);

export default observer((props) => {
  const context = useContext(store);
  const { smsSettingDataSet, singleSendApiMap, serverTypeDs } = context;
  const sendType = smsSettingDataSet.current && smsSettingDataSet.current.getPristineValue('sendType');

  const submitFunc = () => new Promise((resolve, reject) => {
    smsSettingDataSet.validate().then((validateStatus) => {
      if (validateStatus) {
        smsSettingDataSet.submit().then((res) => {
          smsSettingDataSet.query();
          resolve();
        });
      } else {
        reject(new Error('校验未通过'));
      }
    });
  });

  const resetFunc = () => smsSettingDataSet.reset();

  const openSideBar = () => {
    Modal.open({
      title: '修改短信配置',
      drawer: true,
      className: 'msg-config-sider',
      style: {
        width: 380,
      },
      children: (
        <SmsSettingForm context={context} />
      ),
      onOk: submitFunc,
      onCancel: resetFunc,
      // beforeClose: (a, b, c) => { debugger;window.console.log('after close'); },
    });
  };

  function renderType({ value }) {
    const selectedRecord = serverTypeDs.filter((typeRecord) => typeRecord.get('value') === value)[0];
    const meaning = selectedRecord ? selectedRecord.get('meaning') || '-' : '-';
    return meaning;
  }

  return (
    <Page
      service={['choerodon.code.site.setting.notify.msg-config.ps.sms']}
    >
      <Header
        title="通知配置"
      >
        <HeaderButtons items={[{
          name: '修改',
          icon: 'mode_edit',
          display: true,
          permissions: ['choerodon.code.site.setting.notify.msg-config.ps.edit-sms'],
          handler: openSideBar
        }]}
        />
      </Header>
      <Breadcrumb />
      <Content
        values={{ name: context.AppState.getSiteInfo.systemName || 'Choerodon' }}
        className="msg-config"
      >
        <Spin dataSet={smsSettingDataSet}>
          <Form
            className="c7n-smssetting-form"
            pristine
            dataSet={smsSettingDataSet}
            labelLayout="horizontal"
            labelAlign="left"
            labelWidth={150}
          >
            <Output name="serverCode" />
            <Output name="signName" />
            <Output name="serverTypeCode" renderer={renderType} />
            <Output name="endPoint" />
            <Output name="accessKey" />
            <Output name="accessKeySecret" renderer={() => '••••••'} />
          </Form>
        </Spin>
      </Content>
    </Page>
  );
});
