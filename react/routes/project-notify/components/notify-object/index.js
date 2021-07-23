import React from 'react';
import { includes } from 'lodash';
import { Form, SelectBox, Select } from 'choerodon-ui/pro';
import { useProjectNotifyStore } from '../../stores';

import './index.less';

const { Option } = Select;

export default ({ record, allSendRoleList, excludesRole = [] }) => {
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
  } = useProjectNotifyStore();
  const isBacklogFeedback = record.get('code') === 'BACKLOG_FEEDBACK';
  const isSprintDelay = record.get('code') === 'SPRINT_DELAY';
  return (
    <div className={`${prefixCls}-object-content`}>
      <Form record={record}>
        <SelectBox name="sendRoleList" vertical style={{ paddingTop: 0 }}>
          {allSendRoleList.filter((item) => !(isSprintDelay && typeof (item) === 'object') && !includes(excludesRole, item)).filter((item) => (typeof (item) === 'object' ? !!item.backlog === isBacklogFeedback : true)).map((item) => {
            const value = typeof (item) === 'string' ? item : item.code;
            const text = typeof (item) === 'string' ? formatMessage({ id: `${intlPrefix}.object.${isBacklogFeedback ? `backlog_${item}` : item}` }) : item.name;
            return (
              <Option value={value} key={value}>
                <span className={`${prefixCls}-object-content-checkbox`}>
                  {text}
                </span>
              </Option>
            );
          })}
        </SelectBox>
        {record.get('sendRoleList').includes('specifier') && (
          <Select name="userList" maxTagCount={2} searchable />
        )}
      </Form>
    </div>
  );
};
