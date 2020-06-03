import React from 'react';
import { Form, TextField, TextArea, NumberField, message } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import ChoerodonEditor from '../../../components/editor';
import MdEditor from '../../../components/MdEditor';
import './index.less';

export default observer(({ context, modal, type }) => {
  const { messageTypeDetailDataSet } = context;
  const dataSet = messageTypeDetailDataSet.children.messageTemplateVOS;
  let record;
  if (type === 'webHookJson') {
    record = messageTypeDetailDataSet.children.messageTemplateVOS.find((item) => item.getPristineValue('sendingType') === 'WEB_HOOK' && item.getPristineValue('templateCode').includes('JSON'));
  } else if (type === 'webHookOther') {
    record = messageTypeDetailDataSet.children.messageTemplateVOS.find((item) => item.getPristineValue('sendingType') === 'WEB_HOOK' && item.getPristineValue('templateCode').includes('DINGTALKANDWECHAT'));
  } else {
    record = messageTypeDetailDataSet.children.messageTemplateVOS.find((item) => item.getPristineValue('sendingType') === type);
  }
  if (!record) {
    dataSet.create({ templateContent: '',
      sendingType: type.includes('webHook') ? 'WEB_HOOK' : type,
      isPredefined: false,
      isNew: true,
      messageCode: messageTypeDetailDataSet.current.get('messageCode'),
      templateCode: (function () {
        if (type === 'webHookJson') {
          return 'JSON';
        } else if (type === 'webHookOther') {
          return 'DINGTALKANDWECHAT';
        } else {
          return '';
        }
      }()) });
    record = dataSet.current;
  }
  modal.handleOk(async () => {
    try {
      if (dataSet.current.get('isNew')) {
        dataSet.current.set('templateCode', '');
        dataSet.current.set('webhookType', type === 'webHookJson' ? 'Json' : 'DINGTALKANDWECHAT');
      }
      if (await dataSet.submit() !== false) {
        messageTypeDetailDataSet.query();
      } else {
        return false;
      }
    } catch (err) {
      messageTypeDetailDataSet.query();
      return false;
    }
  });
  modal.handleCancel(() => {
    dataSet.reset();
  });
  switch (type) {
    case 'EMAIL':
    case 'WEB':
      return (
        <div className="c7n-notify-contentList-sider">
          <Form record={record}>
            <TextField label={type === 'EMAIL' ? '邮件主题' : '站内信标题'} name="templateTitle" />
            <ChoerodonEditor
              nomore
              toolbarContainer="toolbar"
              value={record.get('templateContent')}
              onChange={(value) => record.set('templateContent', value)}
            />
          </Form>
        </div>
      );
    case 'webhook':
    case 'webHookJson':
    case 'webHookOther':
      return (
        <div className="c7n-notify-contentList-sider">
          <Form record={record}>
            <TextField label="模板主题" name="templateTitle" />
            <MdEditor
              value={record.get('templateContent')}
              onChange={(value) => record.set('templateContent', value)}
            />
          </Form>
        </div>
      );
    case 'SMS':
      return (
        <div className="c7n-notify-contentList-sider">
          <Form record={record}>
            <TextArea resize="vertical" label="短信内容" name="templateContent" />
          </Form>
        </div>
      );
    default:
      return null;
  }
});
