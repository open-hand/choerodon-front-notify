package io.choerodon.notify.api.vo;

import io.choerodon.notify.infra.dto.SendSettingDTO;

import java.util.List;

/**
 * User: Mr.Wang
 * Date: 2020/3/17
 */
public class SendSettingCategoryVO {
    private Long categoryId;

    private String code;

    private String categoryName;

    private String description;

    private List<SendSettingDTO> sendSettingDTOS;

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<SendSettingDTO> getSendSettingDTOS() {
        return sendSettingDTOS;
    }

    public void setSendSettingDTOS(List<SendSettingDTO> sendSettingDTOS) {
        this.sendSettingDTOS = sendSettingDTOS;
    }
}
