import React, { useState, useEffect, useRef } from 'react';
import { Form, DataSet, Select, Button, Row, Col, } from 'choerodon-ui/pro';
import { ModalProps } from 'choerodon-ui/pro/lib/modal/Modal';
import { Divider } from 'choerodon-ui';
import useFields from '@choerodon/agile/lib/routes/Issue/components/BatchModal/useFields';
import { pageConfigApi } from '@choerodon/agile/lib/api';
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

const renderOperations = (field: IField) => {
    const { fieldType, id } = field;
    let operations: {value: Operation, operation: string}[] = [];
    switch(fieldType) {
        case 'multiple': {
            operations = [
                { value: 'in', operation: '包含'},
                { value: 'not_in', operation: '不包含'},
                { value: 'is', operation: '是'},
                { value: 'is_not', operation: '不是'},
            ]
            break;
        }
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
                { value: 'in', operation: '包含'},
                { value: 'not_in', operation: '不包含'},
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
                { value: 'in', operation: '包含'},
                { value: 'not_in', operation: '不包含'},
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
    return (
        <Select required name={`${id}-operation`} placeholder="关系">
            {
                operations.map(item => (
                    <Option key={`${id}-${item.value}`} value={item.value}>{item.operation}</Option>
                ))
            }
        </Select>
    )
};

const RuleModal: React.FC<Props> = ({ modal }) => {
  const formRef: React.MutableRefObject<Form | undefined> = useRef();
    const [rules, setRules] = useState<Rule[]>([]);
    const [fieldData, setFieldData] = useState<IField[]>([]); 
    const [fields, Field] = useFields();

    useEffect(() => {
      Field.add();
      pageConfigApi.loadFieldsByType('=7aReL-jA5szZNGpbbMnDfqpF-SWg1-_JQGrtR1P3sj4==').then((res: IField[]) => {
        const data = res.filter((item) => !find(excludeCode, (code) => code === item.code));
        setFieldData(data);
      });
    }, []);

    const handleClickSubmit = async () => {
      console.log('submit');
      if(formRef && formRef.current) {
        console.log(formRef.current);
        console.log(formRef.current.getFields());
        console.log(await formRef.current.checkValidity());
        if(await formRef.current.checkValidity()) {
          formRef.current.element.submit();
        }
      }
      return false;
    }

    useEffect(() => {
      modal?.handleOk(handleClickSubmit);
    });

    const handleSubmit = () => {
        console.log('触发了submit');
    };

    return (
        <div className={styles.rule_form}>
         <Form onSubmit={handleSubmit} ref={formRef} >
           <div className={`${styles.rule_form_setting} ${styles.rule_form_objectSetting}`}>
               <p className={styles.rule_form_setting_title}>通知对象设置</p>
                <SelectUser
                  style={{
                    width: 600,
                    marginBottom: 27,
                  }}
                  name="notificationObject"
                  label="通知对象"
                  multiple
                />
                <SelectUser
                  style={{
                    width: 600,
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
                                      onChange={(value) => {
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
                                    fieldId: '111',
                                    operation: 'is', 
                                    value: '1123',
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