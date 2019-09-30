package io.choerodon.notify.api.dto;

import javax.persistence.*;

/**
 * @author bgzyy
 * @since 2019/9/11
 */
@Table(name = "NOTIFY_WEBHOOK")
public class WebHookDTO {
    public static final String WEB_HOOK_TYPE_DING_TALK = "DingTalk";
    public static final String WEB_HOOK_TYPE_WE_CHAT = "WeChat";
    public static final String WEB_HOOK_TYPE_JSON = "Json";

    @Id
    @GeneratedValue
    private Long id;
    private String webhookType;
    private String webhookPath;
    private Long projectId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getWebhookType() {
        return webhookType;
    }

    public void setWebhookType(String webhookType) {
        this.webhookType = webhookType;
    }

    public String getWebhookPath() {
        return webhookPath;
    }

    public void setWebhookPath(String webhookPath) {
        this.webhookPath = webhookPath;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }
}