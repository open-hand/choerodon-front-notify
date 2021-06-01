import React, { useContext } from 'react';
import {
  Form, Output, Spin, Modal, Button,
} from 'choerodon-ui/pro';
import {
  axios, Content, Header, Page, Permission, Breadcrumb, Choerodon,
} from '@choerodon/boot';
import { HeaderButtons } from '@choerodon/master';
import store from '../Store';
import MailSettingForm from './MailSettingForm';
import './MailSetting.scss';

const OutputEmptyValue = ({ value }) => (value ? <span>{value}</span> : <span>无</span>);

export default (props) => {
  const context = useContext(store);
  const { mailSettingDataSet } = context;

  const testConnection = async () => {
    try {
      const data = await axios.get('hmsg/choerodon/v1/notices/configs/email/test', mailSettingDataSet.current && mailSettingDataSet.current.toData());
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        Choerodon.prompt(context.intl.formatMessage({ id: `${context.intlPrefix}.connect.success` }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const submitFunc = () => new Promise((resolve, reject) => {
    mailSettingDataSet.validate().then((validateStatus) => {
      if (validateStatus) {
        mailSettingDataSet.submit().then((res) => {
          mailSettingDataSet.query();
          resolve();
        });
      } else {
        reject(new Error('校验未通过'));
      }
    });
  });

  const resetFunc = () => mailSettingDataSet.reset();

  const openSideBar = () => {
    Modal.open({
      title: '修改邮件配置',
      drawer: true,
      className: 'msg-config-sider',
      style: {
        width: 380,
      },
      children: (
        <MailSettingForm context={context} />
      ),
      onOk: submitFunc,
      onCancel: resetFunc,
    });
  };

  return (
    <Page
      service={['choerodon.code.site.setting.notify.msg-config.ps.email']}
    >
      <Header
        title="通知配置"
      >
        <Permission service={['choerodon.code.site.setting.notify.msg-config.ps.edit']}>
          <Button
            onClick={() => openSideBar()}
            icon="edit-o"
          >
            修改
          </Button>
        </Permission>
        <Permission service={['choerodon.code.site.setting.notify.msg-config.ps.connect']}>
          <Button
            style={{
              marginLeft: 16,
            }}
            onClick={testConnection}
            icon="low_priority"
            color="primary"
          >
            连接测试
          </Button>
        </Permission>
      </Header>
      <Breadcrumb />
      <Content
        values={{ name: context.AppState.getSiteInfo.systemName || 'Choerodon' }}
        className="msg-config"
      >
        <Spin dataSet={mailSettingDataSet}>
          <Form className="c7n-mailsetting-form" pristine dataSet={mailSettingDataSet} labelLayout="horizontal" labelAlign="left" labelWidth={120}>
            <Output name="account" />
            <Output renderer={() => '••••••'} name="password" />
            <Output name="sendName" renderer={OutputEmptyValue} />
            <Output name="protocol" />
            <Output name="host" />
            <Output
              name="ssl"
              renderer={({ value }) => (
                <span>{value ? '是' : '否'}</span>
              )}
            />
            <Output name="port" />
          </Form>
        </Spin>
      </Content>
    </Page>
  );
};
