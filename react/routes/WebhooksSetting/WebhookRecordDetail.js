import React, { useEffect, useContext, useMemo, useState } from 'react';
import { Form, DataSet, TextField, Output, Button } from 'choerodon-ui/pro';
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
    }
    init();
  }, []);

  const handleRetry = async () => {
    await useStore.handleRetryRecord(type, id, orgId, webhookRecordDetailDataSet.current.get('recordId'));
    webhookRecordDetailDataSet.query();
  };

  return (
    <React.Fragment>
      <Form labelLayout="horizontal" columns={3} dataSet={webhookRecordDetailDataSet}>
        <Output colSpan={1} name="name" />
        <Output style={{ whiteSpace: 'nowrap' }} colSpan={1} name="sendTime" />
        <Output colSpan={1} name="timeConsuming" />
        <Output colSpan={2} name="webhookPath" />
        <Button onClick={() => handleRetry()} icon="refresh" colSpan={1}>重新执行</Button>
      </Form>
      <p>Request headers</p>
      <div className="webhookRecordDetail_content">
        {requestHeaders}
      </div>
      <p>Request body</p>
      <div className="webhookRecordDetail_content">
        {requestBody}
      </div>
      <p>Response headers</p>
      <div className="webhookRecordDetail_content">
        {responseHeaders}
      </div>
      <p>Response Body</p>
      <div className="webhookRecordDetail_content">
        {responseBody}
      </div>
    </React.Fragment>
  );
};

export default WebhookRecordDetail;
