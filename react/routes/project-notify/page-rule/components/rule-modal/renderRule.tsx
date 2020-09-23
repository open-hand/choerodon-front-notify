import React from 'react';
import { Select, DatePicker, TimePicker, DateTimePicker, TextArea, TextField, NumberField } from 'choerodon-ui/pro';
import { stores } from '@choerodon/boot';
import SelectIssueType from '@choerodon/agile/lib/components/select/select-issue-type';
import SelectStatus from '@choerodon/agile/lib/components/issue-filter-form/components/field/StatusField';
import SelectPriority from '@choerodon/agile/lib/components/select/select-priority';
import SelectComponent from '@choerodon/agile/lib/components/select/select-component';
import SelectLabel from '@choerodon/agile/lib/components/select/select-label';
import SelectVersion from '@choerodon/agile/lib/components/select/select-version';
import SelectEpic from '@choerodon/agile/lib/components/select/select-epic';
import SelectSprint from '@choerodon/agile/lib/components/select/select-sprint';
import SelectUser from '@choerodon/agile/lib/components/select/select-user';
import SelectDemandType from '@choerodon/agile-pro/lib/components/select/select-demand-type';
import SelectTreeDemandClassification from '@choerodon/agile-pro/lib/components/select/select-demand-classification';
import SelectUrgent from '@choerodon/agile-pro/lib/components/select/select-priority';

const { Option } = Select;
const { AppState } = stores;

export type Operation = 'in' | 'not_in' | 'is' | 'is_not' | 'eq' | 'not_eq' | 'gt' | 'gte' | 'lt' | 'lte';

interface FieldOption {
  code: string
  fieldId: string
  id: string
  value: string
  enabled: boolean
}

export interface Rule {
  ao?: 'and' | 'or',
  fieldId: string,
  operation: Operation, 
  value: any,
}

interface FieldOption {
  id: string,
  fieldId: string,
  code: string,
  value: string,
}

export interface IField {
  code: string,
  fieldOptions?: FieldOption[],
  fieldType: string,
  fieldTypeName?: string,
  id: string,
  name: string,
  system: boolean,
  extraConfig?: boolean,
}

export interface IFieldK extends IField {
  key: number,
  request: boolean,
}


const renderRule = (field: IField, fieldValue: Rule = {}) => {
  const isProgram = AppState.currentMenuType.category !== 'PROGRAM';
    const { fieldType, id, system, code, fieldOptions } = field;
    const { operation } = fieldValue;
    if(operation === 'is' || operation === 'is_not' ) {
      return (
        <Select required name={`${id}-value`} placeholder="值">
          <Option value="null">空</Option>
        </Select>
      )
    }
    if(system) {
        switch(code) {
            case 'issueType': {
              return (
                <SelectIssueType required name={`${id}-value`} isProgram={isProgram} />
              )
            }
            case 'status': {
                return (
                    <SelectStatus
                        required
                        name={`${id}-value`} 
                        isProgram={isProgram} 
                    />
                )
            }
            case 'priority': {
                return (
                    <SelectPriority required name={`${id}-value`} />
                )
            }
            case 'component': {
                return <SelectComponent required name={`${id}-value`} />
            }
            case 'label': {
                return <SelectLabel required name={`${id}-value`} />
            }
            case 'influenceVersion':
            case 'fixVersion': {
              return <SelectVersion required name={`${id}-value`} />
            }
            case 'epic': {
              return <SelectEpic required name={`${id}-value`} isProgram={isProgram} />
            }
            case 'sprint': {
              return <SelectSprint required name={`${id}-value`} />
            }
            case 'reporter':
            case 'assignee': {
              return <SelectUser required name={`${id}-value`} />
            }
            case 'backlogType': {
              return <SelectDemandType required name={`${id}-value`} />
            }
            case 'backlogClassification': {
              return <SelectTreeDemandClassification required name={`${id}-value`} />
            }
            case 'urgent': {
              return <SelectUrgent required name={`${id}-value`} />
            }
        }
    }
    switch(fieldType) {
        case 'multiple':
        case 'single': {
            <Select
              required
              placeholder="字段值"
              name={`${id}-value`}
              multiple={operation === 'in' || operation === 'not_in'}
              maxTagCount={2}
              maxTagTextLength={10}
            >
              {(fieldOptions || []).map((item: FieldOption) => {
                if (item.enabled) {
                  return (
                    <Option
                      value={item.id}
                      key={item.id}
                    >
                      {item.value}
                    </Option>
                  );
                }
                return [];
              })}
            </Select>
        }
        case 'member': {
            return (
              <SelectUser required name={`${id}-value`} />
            )
        }
        case 'text': {
            <TextArea
                required
                name={`${id}-value`}
                rows={3}
                maxLength={255}
                style={{ width: '100%' }}
              />
        }
        case 'input': {
            return (
              <TextField
                  required
                  name={`${id}-value`}
                  maxLength={100}
                />
            )
        }
        case 'number': {
           // remainingTime, storyPoints
           return (
            <NumberField
              required
              name={`${id}-value`}
            />
           )
        }
        case 'time': {
          return <TimePicker
          required
          name={`${id}-value`}
        />
        }
        case 'datetime': {
          // creationDate, lastUpdateDate,estimatedStartTime,estimatedEndTime,
          return (<DateTimePicker
            required
            name={`${id}-value`}
        />)
        }
        case 'date': {
            return (<DatePicker required name={`${id}-value`} />)
        }
        default:
         <Select required placeholder="值" />
    }
    return (
      <Select required placeholder="值" />
    )
}

export default renderRule;
