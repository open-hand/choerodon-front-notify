import React from 'react';
import { observer } from 'mobx-react-lite';

import './index.less';
import { useMsgDetailStore } from './stores';

const prefixCls = 'c7ncd-msgDetails';

const MsgDetail = (props) => {
  const {
    msgDetailDs,
    msgEmailDs,
    mainStore,
    isOrgLev,
  } = useMsgDetailStore();

  const renderEmail = () => msgEmailDs.map((record) => (isOrgLev ? record.get('realName') : record.get('receiverAddress'))).join('，');

  function loadMoreEmails() {
    msgEmailDs.query(msgEmailDs.currentPage + 1);
  }

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-item`}>
        <span>
          {isOrgLev ? '接收者' : '接收者邮箱'}
        </span>
        <div className={`${prefixCls}-item-email`}>
          {renderEmail()}
          {
            mainStore.getListHasMore && (
            <span role="none" className={`${prefixCls}-item-email-link`} onClick={loadMoreEmails}>
              加载更多
            </span>
            )
          }
        </div>
      </div>
      <div className={`${prefixCls}-item`}>
        <span>
          邮件内容
        </span>
        <div className={`${prefixCls}-item-doc`} dangerouslySetInnerHTML={{ __html: msgDetailDs.current && msgDetailDs.current.get('content') }} />
      </div>
    </div>
  );
};

export default observer(MsgDetail);
