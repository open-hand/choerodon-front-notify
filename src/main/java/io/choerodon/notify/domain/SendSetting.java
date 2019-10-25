package io.choerodon.notify.domain;

import io.choerodon.mybatis.entity.BaseDTO;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * 消息业务类型
 */

public class SendSetting {

    private Long id;

    private String code;

    private String name;

    private String description;

    @Column(name = "fd_level")
    private String level;

    private String categoryCode;

    private Boolean isAllowConfig;

    @Column(name = "is_enabled")
    private Boolean enabled;

    private Integer retryCount;

    private Boolean isSendInstantly;

    private Boolean isManualRetry;

    private Boolean emailEnabledFlag;

    private Boolean pmEnabledFlag;

    private Boolean smsEnabledFlag;

    private Boolean webhookEnabledFlag;

    private Boolean backlogGFlag;


    public SendSetting(String code) {
        this.code = code;
    }

    public SendSetting(String code, String name, String description,
                       String level, Integer retryCount,
                       Boolean isSendInstantly, Boolean isManualRetry) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.level = level;
        this.retryCount = retryCount;
        this.isSendInstantly = isSendInstantly;
        this.isManualRetry = isManualRetry;
    }

    public SendSetting() {
    }

    @Override
    public String toString() {
        return "SendSetting{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", categoryCode=" + categoryCode +
                ", emailEnabledFlag=" + emailEnabledFlag +
                ", pmEnabledFlag=" + pmEnabledFlag +
                ", level='" + level + '\'' +
                ", smsEnabledFlag='" + smsEnabledFlag + '\'' +
                ", isAllowConfig=" + isAllowConfig +
                ", enabled=" + enabled +
                ", retryCount=" + retryCount +
                ", isSendInstantly=" + isSendInstantly +
                ", isManualRetry=" + isManualRetry +
                ", backlogGFlag=" + backlogGFlag +
                ", webhookEnabledFlag=" + webhookEnabledFlag +
                '}';
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public Boolean getIsSendInstantly() {
        return isSendInstantly;
    }

    public void setIsSendInstantly(Boolean sendInstantly) {
        isSendInstantly = sendInstantly;
    }

    public Boolean getIsManualRetry() {
        return isManualRetry;
    }

    public void setIsManualRetry(Boolean manualRetry) {
        isManualRetry = manualRetry;
    }

    public Boolean getAllowConfig() {
        return isAllowConfig;
    }

    public void setAllowConfig(Boolean allowConfig) {
        isAllowConfig = allowConfig;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public void setCategoryCode(String categoryCode) {
        this.categoryCode = categoryCode;
    }

    public String getCategoryCode() {
        return categoryCode;
    }

    public Boolean getEmailEnabledFlag() {
        return emailEnabledFlag;
    }

    public void setEmailEnabledFlag(Boolean emailEnabledFlag) {
        this.emailEnabledFlag = emailEnabledFlag;
    }

    public Boolean getPmEnabledFlag() {
        return pmEnabledFlag;
    }

    public void setPmEnabledFlag(Boolean pmEnabledFlag) {
        this.pmEnabledFlag = pmEnabledFlag;
    }

    public Boolean getSmsEnabledFlag() {
        return smsEnabledFlag;
    }

    public void setSmsEnabledFlag(Boolean smsEnabledFlag) {
        this.smsEnabledFlag = smsEnabledFlag;
    }

    public Boolean getWebhookEnabledFlag() {
        return webhookEnabledFlag;
    }

    public void setWebhookEnabledFlag(Boolean webhookEnabledFlag) {
        this.webhookEnabledFlag = webhookEnabledFlag;
    }

    public Boolean getBacklogGFlag() {
        return backlogGFlag;
    }

    public void setBacklogGFlag(Boolean backlogGFlag) {
        this.backlogGFlag = backlogGFlag;
    }
}
