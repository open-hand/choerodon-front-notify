package io.choerodon.notify.infra.dto;



import io.choerodon.mybatis.entity.BaseDTO;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

/**
 * 消息模板实体
 * 包括邮件,站内信模板和短信模版
 */
@Table(name = "notify_template")
public class Template extends BaseDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "error.template.isPredefined.null")
    private Boolean isPredefined;

    private String sendingType;

    private String sendSettingCode;

    private String title;

    private String content;



    public Template() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean getIsPredefined() {
        return isPredefined;
    }

    public void setIsPredefined(Boolean predefined) {
        isPredefined = predefined;
    }

    public String getSendingType() {
        return sendingType;
    }

    public void setSendingType(String sendingType) {
        this.sendingType = sendingType;
    }

    public String getSendSettingCode() {
        return sendSettingCode;
    }

    public void setSendSettingCode(String sendSettingCode) {
        this.sendSettingCode = sendSettingCode;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
