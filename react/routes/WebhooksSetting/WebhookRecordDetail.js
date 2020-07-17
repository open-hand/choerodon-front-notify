import React, { useEffect, useContext, useMemo, useState } from 'react';
import { Form, DataSet, TextField, Output, Button } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import WebhookRecordDetailDataSet from './Store/WebhookRecordDetailDataSet';

const WebhookRecordDetail = ({ ds, recordId, itemType, type, id, orgId, useStore }) => {
  const webhookRecordDetailDataSet = useMemo(() => new DataSet(WebhookRecordDetailDataSet()), []);

  const [requestHeaders, setRequestHeaders] = useState(undefined);
  const [requestBody, setRequestBody] = useState(undefined);
  const [responseHeaders, setResponseHeaders] = useState(undefined);
  const [responseBody, setResponseBody] = useState(undefined);

  useEffect(() => {
    async function init() {
      webhookRecordDetailDataSet.queryUrl = `hmsg/choerodon/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks/details/${recordId}`;
      await webhookRecordDetailDataSet.query();
      setRequestHeaders(webhookRecordDetailDataSet.current.get('content'));
      setRequestBody(webhookRecordDetailDataSet.current.get('errorInfo'));
      // setResponseHeaders(webhookRecordDetailDataSet.current.get('webhookRecordDetailVO').responseHeaders);
      // setResponseBody(webhookRecordDetailDataSet.current.get('webhookRecordDetailVO').responseBody);
      // document.getElementsByClassName('webhookRecordDetail_form')[0].querySelectorAll('.c7n-pro-field-label-right')[2].style.textAlign = 'right';
    }
    init();
  }, []);

  const handleRetry = async () => {
    if (itemType === 'RUNNING') {
      await useStore.handleForceFailure(type, id, orgId, webhookRecordDetailDataSet.current.get('recordId'));
    } else {
      await useStore.handleRetryRecord(type, id, orgId, webhookRecordDetailDataSet.current.get('recordId'));
    }
    webhookRecordDetailDataSet.query();
    ds.query();
  };

  const handleRenderWebhookPath = ({ value }) => (
    <Popover content={value}>
      <span>{value}</span>
    </Popover>
  );

  return (
    <React.Fragment>
      <Form className="webhookRecordDetail_form" labelLayout="horizontal" columns={3} dataSet={webhookRecordDetailDataSet}>
        <Output colSpan={1} name="messageName" />
        <Output style={{ whiteSpace: 'nowrap' }} colSpan={1} name="creationDate" />
        <Output className="webhookRecordDetail_timeConsuming" colSpan={1} name="timeConsuming" />
        <Output renderer={handleRenderWebhookPath}  colSpan={2} name="webHookAddress" />
        <div labelWidth={0}>
          <Button
            style={{ color: '#3F51B5', position: 'relative', right: '75px', bottom: '10px', padding: 0 }}
            onClick={() => handleRetry()}
            icon={itemType === 'RUNNING' ? 'power_settings_new' : 'refresh'}
            funcType="flat"
            colSpan={1}
          >{
            itemType === 'RUNNING' ? '强制失败' : '重新执行'
          }
          </Button>
        </div>
      </Form>
      <p className="webhookRecordDetail_pHeader">消息内容</p>
      <div className="webhookRecordDetail_content">
        {requestHeaders}
      </div>
      {
        webhookRecordDetailDataSet.current && webhookRecordDetailDataSet.current.get('statusCode') !== 'S' ? (
          <React.Fragment>
            <p style={{ marginTop: '1em' }} className="webhookRecordDetail_pHeader">错误日志</p>
            <div className="webhookRecordDetail_content">
              {/* {requestBody && ( */}
              {/* <pre> */}
              {/*  <code>{JSON.stringify(JSON.parse(requestBody), null, 4)}</code> */}
              {/* </pre> */}
              {/* )} */}
              {
                requestBody
              }
            </div>
          </React.Fragment>
        ) : ''
      }

      {/* <p className="webhookRecordDetail_pHeader">Response headers</p> */}
      {/* <div className="webhookRecordDetail_content"> */}
      {/*  {responseHeaders && ( */}
      {/*    <pre> */}
      {/*      <code>{JSON.stringify(JSON.parse(responseHeaders), null, 4)}</code> */}
      {/*    </pre> */}
      {/*  )} */}
      {/* </div> */}
      {/* <p className="webhookRecordDetail_pHeader">Response Body</p> */}
      {/* <div className="webhookRecordDetail_content"> */}
      {/*  {responseBody} */}
      {/* </div> */}
    </React.Fragment>
  );
};

export default WebhookRecordDetail;
