/**
 * hover 显示时间
 */
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'choerodon-ui';
import TimeAgo from 'timeago-react';
import { Choerodon } from '@choerodon/boot';

function padZero(str) {
  return str.toString().padStart(2, '0');
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${[year, month, day].map(padZero).join('-')} ${[hour, minutes, seconds].map(padZero).join(':')}`;
}

function TimePopover({ content, style }) {
  const timestamp = content && typeof content === 'string'
    ? Math.min(Date.now(), new Date(content.replace(/-/g, '/')).getTime())
    : false;

  return (
    <div style={style}>
      <Tooltip
        title={formatDate(timestamp || content)}
      >
        <TimeAgo
          datetime={timestamp || content}
          locale={Choerodon.getMessage('zh_CN', 'en')}
        />
      </Tooltip>
    </div>
  );
}

TimePopover.propTypes = {
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  style: PropTypes.object,
};

export default memo(TimePopover);
