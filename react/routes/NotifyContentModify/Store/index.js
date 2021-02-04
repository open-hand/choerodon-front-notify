import React, { createContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import SendSettingDataSet from './SendSettingDataSet';
import TemplateDataSet from './TemplateDataSet';

const Store = createContext();

export default Store;

export const StoreProvider = injectIntl(inject('AppState')(
  (props) => {
    const { AppState: { currentMenuType: { type, id } }, intl, children, detailId } = props;
    const { settingId, settingBusinessType, settingType } = props.match.params;
    const intlPrefix = 'global.notifyContent';
    const prefixCls = 'notify-content';
    const templateDataSet = useMemo(() => new DataSet(TemplateDataSet(settingId, settingBusinessType, settingType, 'query', intl, `${intlPrefix}.template`)));
    const sendSettingDataSet = useMemo(() => new DataSet(SendSettingDataSet(settingId, settingBusinessType, settingType, intl, `${intlPrefix}.sendSetting`, templateDataSet)));
    const createTemplateDataSet = useMemo(() => new DataSet(TemplateDataSet(settingId, settingBusinessType, settingType, 'create', intl, `${intlPrefix}.template`)));
    const value = {
      ...props,
      settingId,
      settingType,
      intlPrefix,
      prefixCls,
      createTemplateDataSet,
      sendSettingDataSet,
      templateDataSet,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
