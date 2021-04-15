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

  return (
    <div className={`${prefixCls}-object-content`}>
      <Form record={record}>
        <SelectBox name="sendRoleList" vertical>
          {allSendRoleList.filter((item) => !includes(excludesRole, item)).map((item) => (
            <Option value={item} key={item}>
              <span className={`${prefixCls}-object-content-checkbox`}>
                {formatMessage({ id: `${intlPrefix}.object.${record.get('code') === 'BACKLOG_FEEDBACK' ? `backlog_${item}` : item}` })}
              </span>
            </Option>
          ))}
        </SelectBox>
        {record.get('sendRoleList').includes('specifier') && (
          <Select name="userList" maxTagCount={2} searchable />
        )}
      </Form>
    </div>
  );
};
