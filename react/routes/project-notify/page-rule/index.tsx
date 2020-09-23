import React, {useMemo} from 'react';
import { Page, Header, Content, Breadcrumb, stores} from '@choerodon/boot';
import {observer} from 'mobx-react-lite';
import {Button, DataSet, Modal} from 'choerodon-ui/pro';
import RuleTable from './components/rule-table';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import styles from './index.less';
import RuleModal from './components/rule-modal';
import RuleDataSet from './components/rule-modal/RuleDataSet';
const { AppState } = stores;

const PageRule = () => {
    const ruleTableDataSet = useMemo(() => {
        return new DataSet({
            autoQuery: true,
            selection: false,
            // transport: {
            //     read: ({ params }) => {
            //     return ({
            //         url: `/agile/v1/projects/${AppState.currentMenuType.id}/backlog/backlog_list`,
            //         method: 'post',
            //     });
            //     },
            // },
            fields: [
                {
                label: '通知对象',
                name: 'notificationObject',
                type: 'string' as FieldType,
                },
                {
                label: '抄送人',
                name: 'ccPerson',
                type: 'string' as FieldType,
                },
                {
                    label: '通知规则',
                    name: 'rule',
                    type: 'array' as FieldType,
                },
            ],
            data: [
                {
                    notificationObject: '易烊千玺、IU',
                    ccPerson: '我是抄送人易烊千玺、IU是抄送人易烊千玺、IU是抄送人易烊千玺、IU是抄送人易烊千玺、IU是抄送人易烊千玺、IU',
                    rule: '规则规则规则规则规则规则规则规则规则规则规则规则规则规则规则规则规则规则',
                },
                {
                    notificationObject: '我是易烊千玺、IU',
                    ccPerson: '我是抄送人易烊千玺、IU是抄送人易烊千玺、IU是抄送人易烊千玺、IU是抄送人易烊千玺、IU是抄送人易烊千玺、IU',
                    rule: '规则规则规则规则规则规则规则规则规则规则规则规则规则规则规则规则规则规则',
                },
                {
                    notificationObject: '易烊千玺、IU易烊千玺、IU易烊千玺、IU易烊千玺、IU易烊千玺、IU易烊千玺、IU易烊千玺、IU',
                    ccPerson: '我是抄送人易烊千玺、IU是抄送人易烊千玺、IU是抄送人易烊千玺、IU是抄送人易烊千玺、IU是抄送人易烊千玺、IU',
                    rule: '规则规则规则规则规则规则规则规则规则规则规则规则规则规则规则规则规则规则',
                },
            ]
            });
    }, []);

    const ruleDataSet: DataSet = useMemo(() => new DataSet(RuleDataSet()), []);

    const handleAddRule = () => {
        Modal.open({
            className: styles.rule_modal,
            drawer: true,
            style: {
            width: 740,
            },
            key: Modal.key(),
            title: '添加规则',
            children: <RuleModal ruleDataSet={ruleDataSet} />,
        })
    };

    return (
        <Page service={[]}>
            <Header>
                <Button icon="playlist_add" onClick={handleAddRule}>添加规则</Button>
            </Header>
            <Breadcrumb />
            <Content>
                <RuleTable tableDataSet={ruleTableDataSet} />
            </Content>
        </Page>
    )
}

export default observer(PageRule);