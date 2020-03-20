package io.choerodon.notify.api.dto;

import io.choerodon.notify.api.vo.WebhookRecordDetailVO;
import io.choerodon.notify.infra.dto.WebhookRecordDetailDTO;

import java.util.Date;

/**
 * @author jiameng.cao
 * @date 2019/11/4
 */
public class WebhookRecordVO {
    private Long recordId;

    private String content;

    private String status;

    private Date sendTime;

    private String sendSettingCode;

    private String sendSettingName;

    private String failedReason;

    private String webhookPath;

    private Long webhookId;

    private String name;
    private Long sourceId;


    private String sourceLevel;

    private Date endTime;

    private String type;

    WebhookRecordDetailVO webhookRecordDetailVO;

    public WebhookRecordDetailVO getWebhookRecordDetailVO() {
        return webhookRecordDetailVO;
    }

    public void setWebhookRecordDetailVO(WebhookRecordDetailVO webhookRecordDetailVO) {
        this.webhookRecordDetailVO = webhookRecordDetailVO;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getSourceId() {
        return sourceId;
    }

    public void setSourceId(Long sourceId) {
        this.sourceId = sourceId;
    }

    public String getSourceLevel() {
        return sourceLevel;
    }

    public void setSourceLevel(String sourceLevel) {
        this.sourceLevel = sourceLevel;
    }

    public Date getEndTime() {
        return endTime;
    }

    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }

    public WebhookRecordDetailDTO getWebhookRecordDetailDTO() {
        return webhookRecordDetailDTO;
    }

    public void setWebhookRecordDetailDTO(WebhookRecordDetailDTO webhookRecordDetailDTO) {
        this.webhookRecordDetailDTO = webhookRecordDetailDTO;
    }

    private WebhookRecordDetailDTO webhookRecordDetailDTO;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getWebhookId() {
        return webhookId;
    }

    public void setWebhookId(Long webhookId) {
        this.webhookId = webhookId;
    }

    public Long getRecordId() {
        return recordId;
    }

    public void setRecordId(Long recordId) {
        this.recordId = recordId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getSendTime() {
        return sendTime;
    }

    public void setSendTime(Date sendTime) {
        this.sendTime = sendTime;
    }

    public String getSendSettingCode() {
        return sendSettingCode;
    }

    public void setSendSettingCode(String sendSettingCode) {
        this.sendSettingCode = sendSettingCode;
    }

    public String getSendSettingName() {
        return sendSettingName;
    }

    public void setSendSettingName(String sendSettingName) {
        this.sendSettingName = sendSettingName;
    }

    public String getFailedReason() {
        return failedReason;
    }

    public void setFailedReason(String failedReason) {
        this.failedReason = failedReason;
    }

    public String getWebhookPath() {
        return webhookPath;
    }

    public void setWebhookPath(String webhookPath) {
        this.webhookPath = webhookPath;
    }
}
