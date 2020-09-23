import React, { useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { TableColumnTooltip, TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
const { Column  } = Table;
interface Props{
    tableDataSet: DataSet,
}

const RuleTable: React.FC<Props> = ({ tableDataSet }) => {
    
    return (
        <Table dataSet={tableDataSet} queryBar={"none" as TableQueryBarType}>
            <Column name="notificationObject" tooltip={"overflow" as TableColumnTooltip} />
            <Column name="ccPerson" tooltip={"overflow" as TableColumnTooltip} />
            <Column name="rule" tooltip={"overflow" as TableColumnTooltip} />
        </Table>
    )
};

export default RuleTable