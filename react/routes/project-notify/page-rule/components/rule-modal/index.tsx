import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, DataSet, Select, Button, Row, Col, } from 'choerodon-ui/pro';
import { ModalProps } from 'choerodon-ui/pro/lib/modal/Modal';
import { Divider } from 'choerodon-ui';
import { toJS } from 'mobx';
import useFields from '@choerodon/agile/lib/routes/Issue/components/BatchModal/useFields';
import { pageConfigApi, fieldApi } from '@choerodon/agile/lib/api';
import { find } from 'lodash';
import styles from './index.less';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import renderRule, { Rule, IField, Operation, IFieldK } from './renderRule';
import SelectUser from '@choerodon/agile/lib/components/select/select-user';
const { Option } = Select;




interface IModalProps extends ModalProps { // pro 组件Modal 注入的modal
    handleOk: (fn:() => Promise<boolean>) => void,
    handleCancel: (promise: () => boolean) => boolean,
    close: (destroy?: boolean) => void,
    update: (modalProps: ModalProps) => void
}


interface Props {
    modal?: IModalProps,
    ruleDataSet: DataSet
}

const excludeCode = ['summary', 'description', 'epicName', 'timeTrace', 'belongToBacklog', 'progressFeedback', 'email'];

const RuleModal: React.FC<Props> = ({ modal }) => {
  const formRef: React.MutableRefObject<Form | undefined> = useRef();
    const [rules, setRules] = useState<Rule[]>([]);
    const [fieldData, setFieldData] = useState<IField[]>([]); 
    const [fields, Field] = useFields();
    const [updateCount, setUpdateCount] = useState<number>(0);

    
    const renderOperations = useCallback((field: IField) => {
      const { fieldType, id } = field;
      let operations: {value: Operation, operation: string}[] = [];
      switch(fieldType) {
          case 'checkbox':
          case 'multiple': {
              operations = [
                  { value: 'in', operation: '包含'},
                  { value: 'not_in', operation: '不包含'},
                  { value: 'is', operation: '是'},
                  { value: 'is_not', operation: '不是'},
              ]
              break;
          }
          case 'radio':
          case 'single': {
              operations = [
                  { value: 'eq', operation: '等于'},
                  { value: 'not_eq', operation: '不等于'},
                  { value: 'is', operation: '是'},
                  { value: 'is_not', operation: '不是'},
              ]
              break;
          }
          case 'member': {
              operations = [
                  { value: 'eq', operation: '等于'},
                  { value: 'not_eq', operation: '不等于'},
                  { value: 'is', operation: '是'},
                  { value: 'is_not', operation: '不是'},
              ]
              break;
          }
          case 'text':
          case 'input': {
              operations = [
                  { value: 'like', operation: '包含'},
                  { value: 'not_like', operation: '不包含'},
                  { value: 'eq', operation: '等于'},
                  { value: 'not_eq', operation: '不等于'},
              ]
              break;
          }
          case 'number': {
              operations = [
                  { value: 'gt', operation: '大于'},
                  { value: 'gte', operation: '大于或等于'},
                  { value: 'lt', operation: '小于'},
                  { value: 'lte', operation: '小于或等于'},
                  { value: 'eq', operation: '等于'},
                  { value: 'is', operation: '是'},
                  { value: 'is_not', operation: '不是'},
              ]
              break;
          }
          case 'time':
          case 'datetime':
          case 'date': {
              operations = [
                  { value: 'gt', operation: '大于'},
                  { value: 'gte', operation: '大于或等于'},
                  { value: 'lt', operation: '小于'},
                  { value: 'lte', operation: '小于或等于'},
                  { value: 'eq', operation: '等于'},
              ]
              break;
          }
      }
      const handleChangeOperation = () => {
        setUpdateCount((count) => count + 1);
        setFieldValue(`${id}-value`, undefined);
      }
      return (
          <Select clearButton={false} required name={`${id}-operation`} placeholder="关系" onChange={handleChangeOperation}>
              {
                  operations.map(item => (
                      <Option key={`${id}-${item.value}`} value={item.value}>{item.operation}</Option>
                  ))
              }
          </Select>
      )
  }, []);

    useEffect(() => {
      Field.add();
      fieldApi.getCustomFields().then((res: IField[]) => {
        const data = res.filter((item) => !find(excludeCode, (code) => code === item.code));
        setFieldData(data);
      });
    }, []);

    const handleClickSubmit = useCallback(async () => {
      console.log('提交数据：');
      console.log(formRef.current.getFields().map(item => ({
        name: item.name,
        value: toJS(item.value),
      })));
      if(formRef && formRef.current) {
        console.log(await formRef.current.checkValidity());
        if(await formRef.current.checkValidity()) {
          // formRef.current.element.submit();
          console.log('提交');
        }
      }
      return false;
    }, []);

    useEffect(() => {
      modal?.handleOk(handleClickSubmit);
    });

    const setFieldValue = useCallback((name: string, value: any) => {
      const fieldValues = formRef?.current?.getFields();
      const currentFieldValue = fieldValues?.find(item => item.name === name);
      if(currentFieldValue) {
        currentFieldValue.value = value;
      }
    }, []);

    const values = formRef?.current?.getFields().map(item => ({
      name: item.name,
      value: toJS(item.value),
    })) || [];

    return (
        <div className={styles.rule_form}>
         <Form ref={formRef} >
           <div className={`${styles.rule_form_setting} ${styles.rule_form_objectSetting}`}>
               <p className={styles.rule_form_setting_title}>通知对象设置</p>
                <SelectUser
                  required
                  style={{
                    width: 600,
                  }}
                  name="notificationObject"
                  label="通知对象"
                  multiple
                />
                <SelectUser
                  required
                  style={{
                    width: 600,
                    marginTop: 27,
                  }}
                  name="ccPerson"
                  label="抄送人"
                  multiple
                />
           </div>
           <Divider />
           <div className={`${styles.rule_form_setting} ${styles.rule_form_ruleSetting}`}>
               <p className={styles.rule_form_setting_title}>通知规则设置</p>
               {
                fields.map((f: IFieldK, i: number, arr: IFieldK[]) => {
                    const { key, id } = f;
                    return (
                        <Row key={key} gutter={20} style={{
                          marginBottom: 15,
                        }}>
                            <Col span={10}>
                              <Row gutter={20}>
                              {
                                  i !== 0 && (
                                    <Col span={8}>
                                    <Select
                                      required
                                      placeholder="关系"
                                      name={`${id}-ao`}
                                      >
                                        <Option value="and">且</Option>
                                        <Option value="or">或</Option>
                                    </Select>
                                    </Col>
                                    
                                    )
                                }
                                <Col span={i !== 0 ? 16 : 24}>
                                  <Select
                                    style={{
                                      width: '100%',
                                    }}
                                      required
                                      placeholder="属性"
                                      name={`${id}-fieldId`}
                                      onChange={(value, oldValue) => {
                                        console.log(value, oldValue, formRef?.current);
                                          // const fieldValue = formRef?.current?.getFields().find(item => item.name === `${oldValue}-operation`);
                                          // console.log(fieldValue);
                                          // fieldValue.value = undefined;
                                          setFieldValue(`${oldValue}-operation`, undefined);
                                          setFieldValue(`${oldValue}-value`, undefined);
                                          const field = find(fieldData, { id: value });
                                          // @ts-ignore
                                          Field.set(key, field);
                                      }}
                                  >
                                  {
                                      fieldData.filter((field: IField) => (
                                      id === field.id
                                      ) || !find(fields, {
                                      id: field.id,
                                      })).map((field:IField) => (
                                      <Option value={field.id}>
                                          {field.name}
                                      </Option>
                                      ))
                                  }
                                  </Select>
                                </Col>
                              </Row>
                            </Col>
                            <Col span={4}>
                                {renderOperations(f)}
                            </Col>
                            <Col span={8} key={id}>
                                {
                                  renderRule(f, {
                                    fieldId: f.id,
                                    operation: values.find(fieldValue => fieldValue.name === `${f.id}-operation`)?.value, 
                                    value: values.find(fieldValue => fieldValue.name === `${f.id}-value`)?.value,
                                  })
                                }
                            </Col>
                            <Col span={2}>
                            <Button
                                disabled={arr.length === 1 && i === 0}
                                onClick={() => {
                                    // @ts-ignore
                                    Field.remove(key);
                                }}
                                icon="delete"
                            />
                        </Col>
                    </Row>
                    );
                })
               }
            <div>
            <Button
                // @ts-ignore
              onClick={Field.add}
              icon="add"
              color={'blue' as ButtonColor}
            >
              添加字段
            </Button>
        </div>
           </div>
        </Form>
        </div>
        
    )
};

export default RuleModal;