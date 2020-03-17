package script.db

databaseChangeLog(logicalFilePath: 'script/db/notify_webhook_record_details.groovy') {
    changeSet(author: 'longhe1996@icloud.com', id: '2020-3-17-notify_webhook_record_details') {
        if (helper.dbType().isSupportSequence()) {
            createSequence(sequenceName: 'NOTIFY_WEBHOOK_RECORD_DETAILS_S', startValue: "1")
        }
        createTable(tableName: "NOTIFY_WEBHOOK_RECORD_DETAIL", remarks: "此表记录某WEBHOOK发送记录的详情") {
            column(name: 'ID', type: 'BIGINT UNSIGNED', autoIncrement: true, remarks: '表 ID，主键，单表时自增、步长为 1') {
                constraints(primaryKey: true, primaryKeyName: 'PK_NOTIFY_WEBHOOK_RECORD_DETAILS')
            }
            column(name: 'WEBHOOK_RECORD_ID', type: 'BIGINT UNSIGNED', remarks: 'WEBHOOK记录的主键') {
                constraints(nullable: false)
            }
            column(name: 'REQUEST_HEADERS', type: 'TEXT', remarks: '请求头') {
                constraints(nullable: false)
            }
            column(name: 'REQUEST_BODY', type: 'TEXT', remarks: '请求体') {
                constraints(nullable: false)
            }
            column(name: 'RESPONSE_HEADERS', type: 'TEXT', remarks: '响应头') {
                constraints(nullable: false)
            }
            column(name: 'RESPONSE_BODY', type: 'TEXT', remarks: '响应体') {
                constraints(nullable: false)
            }

            column(name: "OBJECT_VERSION_NUMBER", type: "BIGINT UNSIGNED", defaultValue: "1")
            column(name: "CREATED_BY", type: "BIGINT UNSIGNED", defaultValue: "0")
            column(name: "CREATION_DATE", type: "DATETIME", defaultValueComputed: "CURRENT_TIMESTAMP")
            column(name: "LAST_UPDATED_BY", type: "BIGINT UNSIGNED", defaultValue: "0")
            column(name: "LAST_UPDATE_DATE", type: "DATETIME", defaultValueComputed: "CURRENT_TIMESTAMP")
        }
    }
}