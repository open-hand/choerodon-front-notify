import React, { useEffect, useState } from 'react';
import { Form, CheckBox, Radio, NumberField, message, TextField } from 'choerodon-ui/pro';
import './index.less';

export default function ({ context, modal }) {
  const { messageTypeDetailDataSet } = context;

  const [enabledList, setEnabledList] = useState({});

  useEffect(() => {
    const obj = {};
    const messageTemplateVOS = messageTypeDetailDataSet.current.get('messageTemplateVOS');
    const keys = ['EMAIL', 'WEB', 'webHookJson', 'webHookOther', 'SMS'];
    keys.forEach(k => {
      let flag = false;
      if (k === 'webHookJson') {
        flag = messageTemplateVOS.find(m => m.sendingType === 'WEB_HOOK') && messageTemplateVOS.find(m => m.sendingType === 'WEB_HOOK').templateCode.includes('JSON');
      } else if (k === 'webHookOther') {
        flag = messageTemplateVOS.find(m => m.sendingType === 'WEB_HOOK') && messageTemplateVOS.find(m => m.sendingType === 'WEB_HOOK').templateCode.includes('DingTalkAndWeChat');
      } else {
        flag = !!messageTemplateVOS.some(m => m.sendingType === k);
      }
      obj[k] = flag;
    });
    setEnabledList(obj);
  }, []);

  modal.handleOk(async () => {
    try {
      if (await messageTypeDetailDataSet.submit() !== false) {
        messageTypeDetailDataSet.query();
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  });
  modal.handleCancel(() => {
    messageTypeDetailDataSet.reset();
  });

  return (
    <div className="c7n-notify-contentList-sider">
      <div className="c7n-notify-contentList-sider-label">发送方式</div>
      <Form columns={4} dataSet={messageTypeDetailDataSet}>
        {/* <TextField renderer={renderCheckbox} name="emailEnabledFlag" /> */}
        <CheckBox disabled={!enabledList.EMAIL} name="emailEnabledFlag" />
        <CheckBox disabled={!enabledList.WEB} name="pmEnabledFlag" />
        <CheckBox disabled={!enabledList.webHookOther} name="webhookEnabledFlag" />
        <CheckBox disabled={!enabledList.webHookJson} name="webhookJsonEnabledFlag" />
        <CheckBox disabled={!enabledList.SMS} name="smsEnabledFlag" />
      </Form>
      <div className="c7n-notify-contentList-sider-label">是否允许配置接收</div>
      <Form columns={4} dataSet={messageTypeDetailDataSet}>
        <Radio colSpan={1} name="allowConfig" value disabled={!messageTypeDetailDataSet.current.get('edit')}>是</Radio>
        <Radio colSpan={2} name="allowConfig" value={false} disabled={!messageTypeDetailDataSet.current.get('edit')}>否</Radio>
      </Form>
      {/* <div className="c7n-notify-contentList-sider-label">是否即时发送</div> */}
      {/* <Form columns={4} dataSet={messageTypeDetailDataSet}> */}
      {/*  <Radio colSpan={1} newLine name="isSendInstantly" value>是</Radio> */}
      {/*  <Radio colSpan={2} name="isSendInstantly" value={false}>否</Radio> */}
      {/* </Form> */}
      <Form columns={4} dataSet={messageTypeDetailDataSet}>
        <NumberField colSpan={4} newLine name="retryCount" help="邮件发送失败后系统默认重发的次数" showHelp="tooltip" />
      </Form>
      {/* <div className="c7n-notify-contentList-sider-label">是否允许手动重发邮件</div> */}
      {/* <Form columns={4} dataSet={messageTypeDetailDataSet}> */}
      {/*  <Radio colSpan={1} newLine name="isManualRetry" value>是</Radio> */}
      {/*  <Radio colSpan={2} name="isManualRetry" value={false}>否</Radio> */}
      {/* </Form> */}
      {/* <div className="c7n-notify-contentList-sider-label">是否为待办提醒</div> */}
      {/* <Form columns={4} dataSet={messageTypeDetailDataSet}> */}
      {/*  <Radio colSpan={1} newLine name="backlogFlag" value>是</Radio> */}
      {/*  <Radio colSpan={2} name="backlogFlag" value={false}>否</Radio> */}
      {/* </Form> */}
    </div>
  );
}
