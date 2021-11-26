import React, {
  useEffect, useContext, useMemo, useState,
} from 'react';
import {
  Form, DataSet, Output, Button,
} from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { useFormatMessage, useFormatCommon } from '@choerodon/master';
import WebhookRecordDetailDataSet from './Store/WebhookRecordDetailDataSet';

const WebhookRecordDetail = ({
  ds, recordId, itemType, type, id, orgId, useStore,
}) => {
  const intlPrefix = 'c7ncd.project.notify';

  const formatProjectNotify = useFormatMessage(intlPrefix);
  const formatCommon = useFormatCommon();
  const webhookRecordDetailDataSet = useMemo(() => new DataSet(WebhookRecordDetailDataSet(formatProjectNotify, formatCommon)), []);

  const [requestHeaders, setRequestHeaders] = useState(undefined);
  const [requestBody, setRequestBody] = useState(undefined);

  useEffect(() => {
    async function init() {
      webhookRecordDetailDataSet.queryUrl = `hmsg/choerodon/v1/${type === 'project' ? `project/${id}` : `organization/${orgId}`}/web_hooks/details/${recordId}`;
      await webhookRecordDetailDataSet.query();
      setRequestHeaders(webhookRecordDetailDataSet.current.get('content'));
      setRequestBody(webhookRecordDetailDataSet.current.get('errorInfo'));
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
    <>
      <Form className="webhookRecordDetail_form" labelLayout="horizontal" columns={3} dataSet={webhookRecordDetailDataSet}>
        <Output colSpan={1} name="messageName" />
        <Output style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} colSpan={1} name="creationDate" />
        <Output className="webhookRecordDetail_timeConsuming" colSpan={1} name="statusMeaning" />
        <Output renderer={handleRenderWebhookPath} colSpan={2} name="webHookAddress" />
        <div labelWidth={0}>
          <Button
            style={{
              color: '#3F51B5', position: 'relative', right: '75px', bottom: '10px', padding: 0,
            }}
            onClick={() => handleRetry()}
            icon={itemType === 'RUNNING' ? 'power_settings_new' : 'refresh'}
            funcType="flat"
            colSpan={1}
          >
            {
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
          <>
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
          </>
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
    </>
  );
};

export default WebhookRecordDetail;
