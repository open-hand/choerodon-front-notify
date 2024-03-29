import React, { useEffect, useState } from 'react';
import { includes } from 'lodash';
import { mount } from '@choerodon/inject';
import { Form, SelectBox, Select } from 'choerodon-ui/pro';
import { useProjectNotifyStore } from '../../stores';
import './index.less';

const { Option } = Select;
const NotifyObject = ({ record, allSendRoleList, excludesRole = [] }) => {
  const {
    prefixCls,
    formatProjectNotify,
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
      <Form record={record} className={`${prefixCls}-object-content-form`}>
        <SelectBox name="sendRoleList" vertical style={{ paddingTop: 0 }} className={`${prefixCls}-object-content-select-box`}>
          {allSendRoleList.filter((item) => !(isSprintDelay && typeof (item) === 'object') && !includes(excludesRole, item)).filter((item) => (typeof (item) === 'object' ? !!item.backlog === isBacklogFeedback : true)).map((item) => {
            const value = typeof (item) === 'string' ? item : item.code;
            const text = typeof (item) === 'string' ? formatProjectNotify({ id: `object.${isBacklogFeedback ? `backlog_${item}` : item}` }) : item.name;
            return (
              <Option value={value} key={value} className={`${prefixCls}-object-content-option`}>
                <span className={`${prefixCls}-object-content-checkbox`}>
                  {text}
                </span>
              </Option>
            );
          })}
        </SelectBox>
        {record.get('sendRoleList').includes('specifier') && mount('agile:SelectUser', {
          name: 'userList', maxTagCount: 2, style: { marginTop: -15, width: '100%' }, getPopupContainer: (e) => e.parentNode, clearButton: true, selectedUser: defaultSelectUser,
        })}
      </Form>
    </div>
  );
};
export default NotifyObject;
