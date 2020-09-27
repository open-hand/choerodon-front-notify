import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, DataSet, Select, Button, Row, Col, } from 'choerodon-ui/pro';
import { ModalProps } from 'choerodon-ui/pro/lib/modal/Modal';
import { Divider } from 'choerodon-ui';
import { axios, stores, Choerodon } from '@choerodon/boot';
import { toJS } from 'mobx';
import useFields from '@choerodon/agile/lib/routes/Issue/components/BatchModal/useFields';
import { getProjectId } from '@choerodon/agile/lib/utils/common';
import { User } from '@choerodon/agile/lib/common/types';
import { fieldApi } from '@choerodon/agile/lib/api';
import { find, map } from 'lodash';
import styles from './index.less';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import renderRule, { Rule, IField, Operation, IFieldK, IFieldWithType, IFieldType, FieldType } from './renderRule';
import SelectUser from '@choerodon/agile/lib/components/select/select-user';
import moment from 'moment';

const { Option } = Select;

interface IModalProps extends ModalProps { // pro 组件Modal 注入的modal
    handleOk: (fn:() => Promise<boolean>) => void,
    handleCancel: (promise: () => boolean) => boolean,
    close: (destroy?: boolean) => void,
    update: (modalProps: ModalProps) => void
}


interface Props {
    modal?: IModalProps,
    ruleTableDataSet: DataSet
    ruleId?: string
}

interface Express {
  fieldCode: string,
  operation: Operation,
  relationshipWithPervious: 'and' | 'or',
  // text,input
  valueStr?: string, // 
  // 单选，member
  valueId?: string, 
  // 多选  
  valueIdList?: string[],
  // number整数,需要判断是否允许小数
  valueNum?: number,
  // number有小数， 需要判断是否允许小数
  valueDecimal?: number,
  // date,datetime
  valueDate?: string,
  // time
  valueDateHms?: string,
  predefined?: boolean,
  fieldType?: FieldType,
  // 是否允许小数，需要判断是否允许小数
  allowDecimals?: boolean,
}
// 'in' | 'not_in' | 'is' | 'is_not' | 'eq' | 'not_eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'not_like'
const operationMap = new Map([
  ['in', '包含'],
  ['not_in', '不包含'],
  ['is', '是'],
  ['is_not', '不是'],
  ['eq', '等于'],
  ['not_eq', '不等于'],
  ['gt', '大于'],
  ['gte', '大于或等于'],
  ['lt', '小于'],
  ['lte', '小于或等于'],
  ['like', '包含'],
  ['not_like', '不包含'],
])

const systemFieldTypeMap = new Map([
  ['assignee', 'member'],
  ['component', 'multiple'],
  ['creation_date', 'datetime'],
  ['epic', 'single'],
  ['estimated_end_time', 'datetime'],
  ['estimated_start_time', 'datetime'],
  ['fix_version', 'multiple'],
  ['influence_version', 'multiple'],
  ['issue_type', 'single'],
  ['label', 'multiple'],
  ['last_update_date', 'datetime'],
  ['priority', 'single'],
  ['remain_time', 'number'],
  ['reporter', 'single'],
  ['sprint', 'single'],
  ['status', 'single'],
  ['story_point', 'number'],
]);

const customTypeMap = new Map([
  ['radio', 'option'],
  ['checkbox', 'option'],
  ['time', 'date_hms'],
  ['datetime', 'date'],
  ['number', 'number'],
  ['input', 'string'],
  ['text', 'text'],
  ['single', 'option'],
  ['multiple', 'option'],
  ['member', 'option'],
  ['date','date'],
]);

const aoMap = new Map([
  ['or', '或'],
  ['and', '且'],
])

const excludeCode = ['summary', 'description', 'epicName', 'timeTrace', 'belongToBacklog', 'progressFeedback', 'email'];

const formatMoment = (type: 'date' | 'datetime' | 'time', d: string) => {
  switch (type) {
    case 'date': {
      return `${moment(d).format('YYYY-MM-DD')} 00:00:00`;
    }
    case 'datetime': {
      return moment(d).format('YYYY-MM-DD HH:mm:ss');
    }
    case 'time': {
      return moment(d).format('HH:mm:ss');
    }
  }
};

const RuleModal: React.FC<Props> = ({ modal, ruleTableDataSet, ruleId }) => {
  const formRef: React.MutableRefObject<Form | undefined> = useRef();
    const [fieldData, setFieldData] = useState<IFieldWithType[]>([]); 
    const [fields, Field] = useFields();
    const [updateCount, setUpdateCount] = useState<number>(0);
    const systemDataRefMap = useRef<Map<string, any>>(new Map());
    const [initRule, setInitRule] = useState({});
    
    const renderOperations = useCallback((field: IFieldWithType) => {
      const { fieldType, code } = field;
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
        setFieldValue(`${code}-value`, undefined);
      }
      return (
          <Select clearButton={false} required name={`${code}-operation`} placeholder="关系" onChange={handleChangeOperation}>
              {
                  operations.map(item => (
                      <Option key={`${code}-${item.value}`} value={item.value}>{item.operation}</Option>
                  ))
              }
          </Select>
      )
  }, []);

  const getSystemFields = useCallback(() => {
    return axios.get(`/agile/v1/projects/${getProjectId()}/configuration_rule/fields`);
  }, []);

    useEffect(() => {
      if(!ruleId) {
        Field.add();
      }
      Promise.all([getSystemFields(),fieldApi.getCustomFields()]).then(([systemFields, customFields]) => {
        const transformedSystemFields = systemFields.map((item: { fieldCode: string; }) => {
          return ({
            ...item,
            code: item.fieldCode,
            fieldType:systemFieldTypeMap.get(item.fieldCode),
            system: true,
          })
        })
        const transformedCustomFields = customFields.map((item: IField) => {
          return ({
            ...initRule,
            ...item,
            type: customTypeMap.get(item.fieldType),
            system: false,
          })
        });
        const data = [...transformedSystemFields, ...transformedCustomFields].filter((item) => !find(excludeCode, (code) => code === item.code));
        setFieldData(data);
      })
    }, []);

    const getFieldValue = useCallback((name) => {
      const fieldValues = formRef?.current?.getFields();
      const currentFieldValue = fieldValues?.find(item => item.name === name);
      if(currentFieldValue) {
        return currentFieldValue.value;
      }
      return undefined;
    }, []);

    const transformValue = useCallback((fieldInfo: IFieldWithType, operation: Operation, value: any) => {
      const { fieldType, type, system, name, fieldOptions, code } = fieldInfo;
      if(operation === 'is' || operation ==='is_not') {
        return '空';
      }
      if(system) {
        const options = systemDataRefMap.current.get(code);
        switch(code) {
          case 'priority':
          case 'status':
          case 'issue_type': {
            const selectOption = find(options, { id: value });
            return selectOption?.name
          }
          case 'component': {
              const selectOptions = options.filter((option: { componentId: string; }) => value.indexOf(option.componentId)>-1);
              return `[${map(selectOptions, 'name').join(',')}]`;
          }
          case 'label': {
            const selectOptions = options.filter((option: { labelId: string; }) => value.indexOf(option.labelId)>-1);
            return `[${map(selectOptions, 'labelName').join(',')}]`;
          }
          case 'influence_version':
          case 'fix_version': {
            const selectOptions = options.filter((option: { versionId: string; }) => value.indexOf(option.versionId)>-1);
            return `[${map(selectOptions, 'name').join(',')}]`;
          }
          case 'epic': {
            const selectOption = find(options, { issueId: value });
            return selectOption?.epicName;
          }
          case 'sprint': {
            const selectOption = find(options, { sprintId: value });
            return selectOption?.sprintName;
          }
          case 'reporter':
          case 'assignee': {
            const selectOption = find(options, { id: value });
            return selectOption?.realName;
          } 
        }
      }
      switch(fieldType) {
        case 'multiple':
        case 'checkbox': {
          const selectOptions = fieldOptions?.filter(option => value.indexOf(option.id)>-1);
          return `[${map(selectOptions, 'value').join(',')}]`;
        }
        case 'radio':
        case 'single': {
          const selectOption = find(fieldOptions, { id: value});
          return selectOption?.value;
        }
        case 'member': {
              const memberOptions = systemDataRefMap.current.get(code);
              const selectMembers = find(memberOptions, { id: value });
              return selectMembers?.realName;
        }
        case 'number':
        case 'text':
        case 'input': {
            return value;
        }
        case 'time': 
        case 'datetime':
        case 'date': {
            return formatMoment(fieldType, value)
        }
        default:
         return value;
      }
    }, []);

    const transformSumitData = useCallback(() => {
      let expressQuery = '';
      const expressList: Express[] = [];
      const values = (formRef?.current?.getFields().map(item => ({
        name: item.name,
        value: toJS(item.value),
      })) || []);
      const codeValues = values.filter((item) => fieldData.find(field => item.name?.split('-')[1] === 'code'));
      codeValues.forEach((codeField) => {
        const code = codeField.name?.split('-')[0];
        if(code) {
          const fieldInfo = fieldData.find((item) => item.code === code);
          if(fieldInfo) {
            const { fieldType, type, system, name } = fieldInfo;
            const valueIsNull = getFieldValue(`${code}-operation`) === 'is' || getFieldValue(`${code}-operation`) === 'is_not';
            const value = toJS(getFieldValue(`${code}-value`));
            expressList.push({
              fieldCode: code,
              operation: getFieldValue(`${code}-operation`),
              relationshipWithPervious: getFieldValue(`${code}-ao`),
              // text,input
              valueStr: (fieldType === 'input' || fieldType === 'text') && !valueIsNull ? value : undefined,
              // 单选，member
              valueId: (fieldType === 'single' || fieldType === 'member' || fieldType === 'radio') && !valueIsNull  ? value : undefined, 
              // 多选  
              valueIdList: (fieldType === 'multiple' || fieldType === 'checkbox') && !valueIsNull  ? value : undefined,
              // number整数,需要判断是否允许小数
              valueNum: fieldType === 'number' && !valueIsNull  ? value : undefined,
              // number有小数， 需要判断是否允许小数
              valueDecimal: fieldType === 'number' && !valueIsNull  ? value : undefined,
              // date,datetime
              valueDate: (fieldType === 'date' || fieldType === 'datetime') && !valueIsNull  ? formatMoment(fieldType, value) : undefined,
              // time
              valueDateHms: fieldType === 'time' && !valueIsNull  ? formatMoment(fieldType, value) : undefined,
              predefined: system,
              fieldType: type,
              // 是否允许小数，需要判断是否允许小数
              allowDecimals: fieldType === 'number' && !valueIsNull  ? false : undefined,
            })
            const ao = getFieldValue(`${code}-ao`) && aoMap.get(getFieldValue(`${code}-ao`));
            expressQuery += `${ao ? `${ao} `: ''}${name} ${operationMap.get(getFieldValue(`${code}-operation`))} ${transformValue(fieldInfo, getFieldValue(`${code}-operation`), getFieldValue(`${code}-value`))} `;
          }
        }
      });
      return {
        expressQuery,
        expressList,
      }
    }, [fieldData]);

    const handleClickSubmit = useCallback(async () => {
      if(formRef && formRef.current) {
        if(await formRef.current.checkValidity()) {
          const expressObj = transformSumitData();
          const data = {
            receiverList: (toJS(getFieldValue('receiverList')) || []).map((id: string) => ({id})),
            ccList: (toJS(getFieldValue('ccList')) || []).map((id: string) => ({id})),
            ...expressObj,
          }
          if(!ruleId) {
            return axios.post(`/agile/v1/projects/${getProjectId()}/configuration_rule`, data).then(() => {
              Choerodon.prompt('创建成功');
              ruleTableDataSet.query();
              return true;
            }).catch(() => {
              Choerodon.prompt('创建失败');
              return false;
            });
          }
          return axios.put(`/agile/v1/projects/${getProjectId()}/configuration_rule/${ruleId}`, data).then(() => {
            Choerodon.prompt('编辑成功');
            ruleTableDataSet.query();
            return true;
          }).catch(() => {
            Choerodon.prompt('编辑失败');
            return false;
          });
        }
      }
      return false;
    }, [fieldData, transformSumitData]);

    useEffect(() => {
      modal?.handleOk(handleClickSubmit);
    });

    useEffect(() => {
      if(ruleId && fieldData) {
        axios.get(`/agile/v1/projects/${getProjectId()}/configuration_rule/${ruleId}`).then(res => {
          const {ccList = [], receiverList = [], expressList = []} = res;
          setFieldValue('ccList', ccList.map((item: User) => item.id));
          setFieldValue('receiverList', receiverList.map((item: User) => item.id));
          const existFields = fieldData.filter((item: IFieldWithType) => find(expressList, { fieldCode: item.code}));
          Field.init(existFields);
          expressList.forEach((item: Express) => {
            const { 
              fieldCode, relationshipWithPervious, operation, valueStr, valueId, valueIdList, valueNum, valueDecimal, valueDate, valueDateHms,
            } = item;
            const field = find(fieldData, { code: fieldCode});
            const fieldValue = valueStr || valueId || valueIdList || valueNum || valueDecimal || valueDate || valueDateHms;
            if(field) {
              const { fieldType, code } = field;
              setFieldValue(`${code}-code`, fieldCode);
              setFieldValue(`${code}-operation`, operation);
              setFieldValue(`${code}-value`, fieldType === 'date' || fieldType === 'datetime' || fieldType === 'time' ? moment(fieldType === 'time' ? `${moment().format('YYYY-MM-DD')} ${fieldValue}` : fieldValue) : fieldValue);
              if(relationshipWithPervious) {
                setFieldValue(`${code}-ao`, relationshipWithPervious);
              }
            }
          });
          setInitRule(res);
        }).catch((e: ErrorEvent) => {
          console.log(e);
        });
      }
    }, [ruleId, fieldData]);

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
         <Form ref={formRef as React.RefObject<Form>} >
           <div className={`${styles.rule_form_setting} ${styles.rule_form_objectSetting}`}>
               <p className={styles.rule_form_setting_title}>通知对象设置</p>
                <SelectUser
                  required
                  style={{
                    width: 600,
                  }}
                  name="receiverList"
                  label="通知对象"
                  multiple
                  maxTagCount={6}
                  maxTagTextLength={4}
                />
                <SelectUser
                  style={{
                    width: 600,
                    marginTop: 27,
                  }}
                  name="ccList"
                  label="抄送人"
                  multiple
                  maxTagCount={6}
                  maxTagTextLength={4}
                />
           </div>
           <Divider />
           <div className={`${styles.rule_form_setting} ${styles.rule_form_ruleSetting}`}>
               <p className={styles.rule_form_setting_title}>通知规则设置</p>
               {
                fields.map((f: IFieldK, i: number, arr: IFieldK[]) => {
                    const { key, id, code } = f;
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
                                      name={`${code}-ao`}
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
                                      name={`${code}-code`}
                                      onChange={(value, oldValue) => {
                                          setFieldValue(`${oldValue}-operation`, undefined);
                                          setFieldValue(`${oldValue}-value`, undefined);
                                          const field = find(fieldData, { code: value });
                                          // @ts-ignore
                                          Field.set(key, field);
                                      }}
                                  >
                                  {
                                      fieldData.filter((field: IFieldWithType) => (
                                      code === field.code
                                      ) || !find(fields, {
                                      code: field.code,
                                      })).map((field:IFieldWithType) => (
                                      <Option value={field.code}>
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
                                    code,
                                    operation: values.find(fieldValue => fieldValue.name === `${code}-operation`)?.value, 
                                    value: values.find(fieldValue => fieldValue.name === `${code}-value`)?.value,
                                  }, systemDataRefMap)
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