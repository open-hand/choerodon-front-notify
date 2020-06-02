import React, { useContext } from 'react';
import { Form, TextField, Select, SelectBox, Password, NumberField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import '../index.less';

const { Option } = Select;

export default observer(({ context }) => (
  <Form dataSet={context.smsSettingDataSet}>
    <TextField name="serverCode" />
    <TextField name="signName" />
    <Select name="serverTypeCode" />
    <TextField name="endPoint" />
    <TextField name="accessKey" />
    <Password name="accessKeySecret" />
  </Form>
));
