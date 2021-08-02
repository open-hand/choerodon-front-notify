import React, {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import {
  axios,
} from '@choerodon/boot';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import TableDataSet from './TableDataSet';
import { useProjectNotifyStore } from '../../stores';

const Store = createContext();

export function useAgileContentStore() {
  return useContext(Store);
}
const HAS_BACKLOG = C7NHasModule('@choerodon/backlog');
export const StoreProvider = injectIntl(inject('AppState')(observer((props) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId, organizationId, categories } },
  } = props;
  const {
    userDs,
  } = useProjectNotifyStore();
  const intlPrefix = 'project.notify';
  const projectCategoryCodes = useMemo(() => categories?.map((i) => i.code) || [], [categories]);
  const [allSendRoleList, setAllSendRoleList] = useState(['reporter', 'assignee', 'starUser', 'projectOwner', 'specifier']);
  useEffect(() => {
    async function loadAgileRoleList(issueTypeList = 'agileIssueType') {
      if (issueTypeList === 'agileIssueType' && !projectCategoryCodes.includes('N_AGILE')) {
        return [];
      }
      if (issueTypeList === 'backlogIssueType' && !projectCategoryCodes.includes('N_REQUIREMENT')) {
        return [];
      }
      return axios({
        method: 'get',
        url: `/agile/v1/projects/${projectId}/field_value/list/custom_field`,
        params: {
          issueTypeList,
          organizationId,
        },
      });
    }
    axios.all([loadAgileRoleList(), loadAgileRoleList('backlogIssueType')]).then((res) => {
      const [agileMemberList, backlogMemberList] = res.map((item) => item.filter((field) => ['member', 'multiMember'].includes(field.fieldType)));
      setAllSendRoleList(['reporter', 'assignee', 'mainResponsible', 'starUser', 'projectOwner', ...agileMemberList.map((item) => ({ ...item, agile: true })),
        ...backlogMemberList.map((item) => ({ ...item, backlog: true })), 'specifier']);
    });
  }, [organizationId, projectCategoryCodes, projectId]);
  const tableDs = useMemo(() => new DataSet(TableDataSet({
    formatMessage, intlPrefix, projectId, userDs,
  })), [projectId]);
  const value = {
    ...props,
    intlPrefix,
    prefixCls: 'project-notify',
    permissions: [
      'notify-service.message-setting.listByType',
      'notify-service.message-setting.batchUpdateByType',
    ],
    allSendRoleList,
    tableDs,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
