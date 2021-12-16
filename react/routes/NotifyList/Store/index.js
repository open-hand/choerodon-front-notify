import React, { createContext, useMemo, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { useFormatMessage, useFormatCommon } from '@choerodon/master';
import TemplateDataSet from './TemplateDataSet';
import MessageTypeTableDataSet from './MessageTypeTableDataSet';
import MessageTypeDetailDataSet from './MessageTypeDetailDataSet';
import QueryTreeDataSet from './QueryTreeDataSet';
import LevelDataSet from './LevelDataSet';
import useStore from './useStore';

const Store = createContext();

export default Store;

export const StoreProvider = withRouter(injectIntl(inject('AppState')(

  (props) => {
    const intlPrefix = 'c7n.msg-service';
    const format = useFormatMessage(intlPrefix);
    const formatCommon = useFormatCommon();
    const { AppState: { currentMenuType: { type, id, organizationId } }, intl, children } = props;
    const [currentPageType, setCurrentPageType] = useState({
      currentSelectedType: 'table',
      icon: 'folder_open2',
      title: format({ id: 'all' }),
      id: null,
    });

    const messageStore = useStore();
    const levelDataSet = useMemo(() => new DataSet(LevelDataSet()), []);
    const messageTypeTableDataSet = useMemo(() => new DataSet(MessageTypeTableDataSet({
      levelDataSet, intlPrefix, format, formatCommon,
    })), []);
    const templateDataSet = useMemo(() => new DataSet(TemplateDataSet(organizationId)), []);
    const messageTypeDetailDataSet = useMemo(() => new DataSet(MessageTypeDetailDataSet(templateDataSet)), []);
    const queryTreeDataSet = useMemo(() => new DataSet(QueryTreeDataSet({ setCurrentPageType, store: messageStore })), []);
    const value = {
      ...props,
      messageTypeTableDataSet,
      templateDataSet,
      messageTypeDetailDataSet,
      queryTreeDataSet,
      currentPageType,
      setCurrentPageType,
      intl,
      messageStore,
      formatCommon,
      format,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
)));
