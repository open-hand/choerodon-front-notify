import React, { useEffect, useState } from 'react';
import { includes } from 'lodash';
import { mount } from '@choerodon/inject';
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
  const [defaultSelectUser, setDefaultSelectUser] = useState();

  useEffect(() => {
    if (record.get('sendRoleList').includes('specifier')) {
      !record.getState('isInitSelectSpecifier') && setDefaultSelectUser(record.get('userList'));
      record.setState('isInitSelectSpecifier', true);
    } else {
      record.setState('isInitSelectSpecifier', false);
    }
  }, [record.get('sendRoleList')]);
  return (
    <div role="none" className={`${prefixCls}-object-content`} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
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
        {/* {record.get('sendRoleList').includes('specifier') && (
          <div style={{ width: '100%' }} role="none">
            <SelectUser
              name="userList"
              maxTagCount={2}
              getPopupContainer={(e) => e.parentNode}
              clearButton
              selectedUser={defaultSelectUser}
            />
          </div>
        )} */}
        {record.get('sendRoleList').includes('specifier') && mount('agile:SelectUser', {
          name: 'userList', maxTagCount: 2, getPopupContainer: (e) => e.parentNode, clearButton: true, selectedUser: defaultSelectUser,
        })}
      </Form>
    </div>
  );
};
