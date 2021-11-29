import React from 'react';
import { PageTab, PageWrap } from '@choerodon/boot';
import {
  useFormatMessage,
} from '@choerodon/master';
import { StoreProvider } from './stores';
import ProjectNotify from './project-notify';
import SiteNotify from './site-notify';

// eslint-disable-next-line import/no-anonymous-default-export
export default (props) => {
  const intlPrefix = 'c7ncd.receive-setting';
  const formatClient = useFormatMessage(intlPrefix);
  return (
    <StoreProvider {...props}>
      <PageWrap noHeader={['choerodon.code.person.receive-setting-project', 'choerodon.code.person.receive-setting-site']}>
        <PageTab route="/notify/receive-setting/project" title={formatClient({ id: 'projectNotice' })} tabKey="choerodon.code.person.receive-setting-project" component={ProjectNotify} />
        <PageTab route="/notify/receive-setting/site" title={formatClient({ id: 'platformNotice' })} tabKey="choerodon.code.person.receive-setting-site" component={SiteNotify} />
      </PageWrap>
    </StoreProvider>
  );
};
