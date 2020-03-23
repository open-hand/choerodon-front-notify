package io.choerodon.notify.api.vo;

/**
 * User: Mr.Wang
 * Date: 2020/3/20
 */
public class WebhookRecordDetailVO {
    private Long deatilId;

    private Long webhookRecordId;
    private String requestHeaders;
    private String requestBody;
    private String responseHeaders;
    private String responseBody;
    private String retryData;

    public Long getDeatilId() {
        return deatilId;
    }

    public void setDeatilId(Long deatilId) {
        this.deatilId = deatilId;
    }

    public Long getWebhookRecordId() {
        return webhookRecordId;
    }

    public void setWebhookRecordId(Long webhookRecordId) {
        this.webhookRecordId = webhookRecordId;
    }

    public String getRequestHeaders() {
        return requestHeaders;
    }

    public void setRequestHeaders(String requestHeaders) {
        this.requestHeaders = requestHeaders;
    }

    public String getRequestBody() {
        return requestBody;
    }

    public void setRequestBody(String requestBody) {
        this.requestBody = requestBody;
    }

    public String getResponseHeaders() {
        return responseHeaders;
    }

    public void setResponseHeaders(String responseHeaders) {
        this.responseHeaders = responseHeaders;
    }

    public String getResponseBody() {
        return responseBody;
    }

    public void setResponseBody(String responseBody) {
        this.responseBody = responseBody;
    }

    public String getRetryData() {
        return retryData;
    }

    public void setRetryData(String retryData) {
        this.retryData = retryData;
    }
}
