package io.choerodon.notify.infra.dto;

import io.choerodon.mybatis.entity.BaseDTO;
import io.swagger.annotations.ApiModelProperty;
import io.swagger.annotations.ApiOperation;
import org.springframework.data.annotation.Transient;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotEmpty;

/**
 * @author bgzyy
 * @since 2019/9/11
 */
@Table(name = "NOTIFY_WEBHOOK")
public class WebHookDTO extends BaseDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ApiModelProperty("主键ID")
    private Long id;

    @ApiModelProperty("webhook名称")
    private String name;

    @NotEmpty(message = "error.web.hook.create.or.update.type.can.not.be.empty")
    @ApiModelProperty("webhook类型/必填字段")
    private String type;

    @ApiModelProperty("webhook地址/必填字段")
    @NotEmpty(message = "error.web.hook.create.or.update.path.can.not.be.empty")
    private String webhookPath;

    @ApiModelProperty("钉钉的加签密钥")
    private String secret;

    @ApiModelProperty("项目或组织ID/必填字段")
    private Long sourceId;

    @ApiModelProperty("webhook的层级")
    private String sourceLevel;

    @ApiModelProperty("webhook是否启用")
    private Boolean enableFlag;

    public Long getId() {
        return id;
    }

    public WebHookDTO setId(Long id) {
        this.id = id;
        return this;
    }

    public String getWebhookPath() {
        return webhookPath;
    }

    public WebHookDTO setWebhookPath(String webhookPath) {
        this.webhookPath = webhookPath;
        return this;
    }

    public Long getSourceId() {
        return sourceId;
    }

    public void setSourceId(Long sourceId) {
        this.sourceId = sourceId;
    }

    public String getName() {
        return name;
    }

    public WebHookDTO setName(String name) {
        this.name = name;
        return this;
    }

    public String getSecret() {
        return secret;
    }

    public WebHookDTO setSecret(String secret) {
        this.secret = secret;
        return this;
    }

    public String getType() {
        return type;
    }

    public WebHookDTO setType(String type) {
        this.type = type;
        return this;
    }

    public Boolean getEnableFlag() {
        return enableFlag;
    }

    public WebHookDTO setEnableFlag(Boolean enableFlag) {
        this.enableFlag = enableFlag;
        return this;
    }

    public String getSourceLevel() {
        return sourceLevel;
    }

    public WebHookDTO setSourceLevel(String sourceLevel) {
        this.sourceLevel = sourceLevel;
        return this;
    }
}