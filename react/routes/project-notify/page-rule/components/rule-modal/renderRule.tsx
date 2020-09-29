import React, { useRef } from 'react';
import {
  Select, DatePicker, TimePicker, DateTimePicker, TextArea, TextField, NumberField, DataSet,
} from 'choerodon-ui/pro';
import { stores } from '@choerodon/boot';
import moment from 'moment';
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

export type Operation = 'in' | 'not_in' | 'is' | 'is_not' | 'eq' | 'not_eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'not_like' | '';
export type IFieldType = 'radio' | 'checkbox' | 'single' | 'multiple' | 'date' | 'datetime' | 'time' | 'number' | 'member' | 'text' | 'input';
export type FieldType = 'option' | 'date_hms' | 'date' | 'number' | 'string' | 'text';
interface FieldOption {
  code: string
  fieldId: string
  id: string
  value: string
  enabled: boolean
}

export interface Rule {
  ao?: 'and' | 'or',
  code: string,
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

export interface IFieldWithType extends IField {
  type: FieldType,
}

export interface IFieldK extends IField {
  key: number,
  request: boolean,
  type: FieldType,
}

const renderRule = (dataset: DataSet, fieldK: IFieldK, fieldData: IField[], systemDataRefMap: React.MutableRefObject<Map<string, any>>) => {
  const isProgram = AppState.currentMenuType.category === 'PROGRAM';
  const { key } = fieldK;
  const field = fieldData.find((item: IField) => item.code === dataset?.current?.get(`${key}-code`));
  const operation = dataset?.current?.get(`${key}-operation`);
  if (operation === 'is' || operation === 'is_not') {
    return (
      <Select required name={`${key}-value`} label="值">
        <Option value="empty">空</Option>
      </Select>
    );
  }
  if (field) {
    const {
      fieldType, system, code, fieldOptions, extraConfig,
    } = field;
    if (system) {
      switch (code) {
        case 'issue_type': {
          return (
            <SelectIssueType
              required
              name={`${key}-value`}
              isProgram={isProgram}
              label="值"
              valueField="typeCode"
              afterLoad={(data) => {
                systemDataRefMap.current.set(code, data || []);
              }}
            />
          );
        }
        case 'status': {
          return (
            <SelectStatus
              required
              name={`${key}-value`}
              isProgram={isProgram}
              label="值"
              afterLoad={(data) => {
                systemDataRefMap.current.set(code, data || []);
              }}
            />
          );
        }
        case 'priority': {
          return (
            <SelectPriority
              required
              name={`${key}-value`}
              label="值"
              afterLoad={(data) => {
                systemDataRefMap.current.set(code, data || []);
              }}
            />
          );
        }
        case 'component': {
          return (
            <SelectComponent
              valueField="componentId"
              multiple
              required
              name={`${key}-value`}
              label="值"
              maxTagCount={2}
              maxTagTextLength={10}
              afterLoad={(data) => {
                systemDataRefMap.current.set(code, data || []);
              }}
            />
          );
        }
        case 'label': {
          return (
            <SelectLabel
              valueField="labelId"
              multiple
              required
              name={`${key}-value`}
              label="值"
              maxTagCount={2}
              maxTagTextLength={10}
              afterLoad={(data) => {
                systemDataRefMap.current.set(code, data || []);
              }}
            />
          );
        }
        case 'influence_version':
        case 'fix_version': {
          return (
            <SelectVersion
              valueField="versionId"
              multiple
              required
              name={`${key}-value`}
              label="值"
              maxTagCount={2}
              maxTagTextLength={10}
              afterLoad={(data) => {
                systemDataRefMap.current.set(code, data || []);
              }}
            />
          );
        }
        case 'epic': {
          return (
            <SelectEpic
              required
              name={`${key}-value`}
              isProgram={isProgram}
              label="值"
              afterLoad={(data) => {
                systemDataRefMap.current.set(code, data || []);
              }}
            />
          );
        }
        case 'sprint': {
          return (
            <SelectSprint
              required
              name={`${key}-value`}
              label="值"
              afterLoad={(data) => {
                systemDataRefMap.current.set(code, data || []);
              }}
            />
          );
        }
        case 'reporter':
        case 'assignee': {
          return (
            <SelectUser
              required
              name={`${key}-value`}
              label="值"
              afterLoad={(data) => {
                systemDataRefMap.current.set(code, data || []);
              }}
            />
          );
        }
              // case 'backlogType': {
              //   return <SelectDemandType required name={`${key}-value`} label="值" />
              // }
              // case 'backlogClassification': {
              //   return <SelectTreeDemandClassification required name={`${key}-value`} label="值" />
              // }
              // case 'urgent': {
              //   return <SelectUrgent required name={`${key}-value`} label="值" />
              // }
      }
    }
    switch (fieldType) {
      case 'radio':
      case 'checkbox':
      case 'multiple':
      case 'single': {
        return (
          <Select
            key={code}
            required
            label="值"
            name={`${key}-value`}
            multiple={fieldType === 'checkbox' || fieldType === 'multiple'}
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
        );
      }
      case 'member': {
        return (
          <SelectUser required name={`${key}-value`} label="值" />
        );
      }
      case 'text': {
        return (
          <TextArea
            required
            name={`${key}-value`}
            rows={3}
            maxLength={255}
            style={{ width: '100%' }}
            label="值"
          />
        );
      }
      case 'input': {
        return (
          <TextField
            required
            name={`${key}-value`}
            maxLength={100}
            label="值"
          />
        );
      }
      case 'number': {
        // remain_time, story_point
        return (
          <NumberField
            required
            name={`${key}-value`}
            label="值"
            step={extraConfig ? 0.01 : 1}
            min={(code === 'story_point' || code === 'remain_time') ? 0 : undefined}
            max={(code === 'story_point' || code === 'remain_time') ? 100 : undefined}
          />
        );
      }
      case 'time': {
        return (
          <TimePicker
            required
            name={`${key}-value`}
            label="值"
          />
        );
      }
      case 'datetime': {
        // creationDate, lastUpdateDate,estimatedStartTime,estimatedEndTime,
        return (
          <DateTimePicker
            required
            name={`${key}-value`}
            label="值"
          />
        );
      }
      case 'date': {
        return (<DatePicker required name={`${key}-value`} label="值" />);
      }
      default:
  <Select required label="值" />;
    }
  }

  return (
    <Select name={`${key}-value`} required label="值" />
  );
};

export default renderRule;
