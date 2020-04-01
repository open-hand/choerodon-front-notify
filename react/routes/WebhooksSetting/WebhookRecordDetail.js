import React, { useEffect, useContext, useMemo, useState } from 'react';
import { Form, DataSet, TextField, Output, Button } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import WebhookRecordDetailDataSet from './Store/WebhookRecordDetailDataSet';

const WebhookRecordDetail = ({ recordId, type, id, orgId, useStore }) => {
  const webhookRecordDetailDataSet = useMemo(() => new DataSet(WebhookRecordDetailDataSet()), []);

  const [requestHeaders, setRequestHeaders] = useState(undefined);
  const [requestBody, setRequestBody] = useState(undefined);
  const [responseHeaders, setResponseHeaders] = useState(undefined);
  const [responseBody, setResponseBody] = useState(undefined);

  useEffect(() => {
    async function init() {
      webhookRecordDetailDataSet.queryUrl = `notify/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hook_records/deatils/${recordId}`;
      await webhookRecordDetailDataSet.query();
      setRequestHeaders(webhookRecordDetailDataSet.current.get('webhookRecordDetailVO').requestHeaders);
      setRequestBody(webhookRecordDetailDataSet.current.get('webhookRecordDetailVO').requestBody);
      setResponseHeaders(webhookRecordDetailDataSet.current.get('webhookRecordDetailVO').responseHeaders);
      setResponseBody(webhookRecordDetailDataSet.current.get('webhookRecordDetailVO').responseBody);
      document.getElementsByClassName('webhookRecordDetail_form')[0].querySelectorAll('.c7n-pro-field-label-right')[2].style.textAlign = 'right';
    }
    init();
  }, []);

  const handleRetry = async () => {
    await useStore.handleRetryRecord(type, id, orgId, webhookRecordDetailDataSet.current.get('recordId'));
    webhookRecordDetailDataSet.query();
  };

  return (
    <React.Fragment>
      <Form className="webhookRecordDetail_form" labelLayout="horizontal" columns={3} dataSet={webhookRecordDetailDataSet}>
        <Output colSpan={1} name="name" />
        <Output style={{ whiteSpace: 'nowrap' }} colSpan={1} name="sendTime" />
        <Output className="webhookRecordDetail_timeConsuming" colSpan={1} name="timeConsuming" />
        <Output style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} colSpan={2} name="webhookPath" />
        <div labelWidth={0}>
          <Button style={{ color: '#3F51B5', position: 'relative', right: '75px', bottom: '10px', padding: 0 }} onClick={() => handleRetry()} icon="refresh" funcType="flat" colSpan={1}>重新执行</Button>
        </div>
      </Form>
      <p className="webhookRecordDetail_pHeader">Request headers</p>
      <div className="webhookRecordDetail_content">
        {requestHeaders}
      </div>
      <p className="webhookRecordDetail_pHeader">Request body</p>
      <div className="webhookRecordDetail_content">
        {requestBody && (
          <pre>
            <code>{JSON.stringify(JSON.parse(requestBody), null, 4)}</code>
          </pre>
        )}
      </div>
      <p className="webhookRecordDetail_pHeader">Response headers</p>
      <div className="webhookRecordDetail_content">
        {responseHeaders && (
          <pre>
            <code>{JSON.stringify(JSON.parse(responseHeaders), null, 4)}</code>
          </pre>
        )}
      </div>
      <p className="webhookRecordDetail_pHeader">Response Body</p>
      <div className="webhookRecordDetail_content">
        {responseBody}
      </div>
    </React.Fragment>
  );
};

export default WebhookRecordDetail;
