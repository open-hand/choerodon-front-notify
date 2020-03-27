package io.choerodon.notify.api.service.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import io.choerodon.core.oauth.DetailsHelper;
import io.choerodon.notify.api.dto.WebhookRecordVO;
import io.choerodon.notify.api.service.WebhookRecordService;
import io.choerodon.notify.api.validator.WebHookValidator;
import io.choerodon.notify.infra.dto.WebhookRecordDTO;
import io.choerodon.notify.infra.feign.UserFeignClient;
import io.choerodon.notify.infra.mapper.WebhookRecordMapper;
import io.choerodon.web.util.PageableHelper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

/**
 * @author jiameng.cao
 * @date 2019/11/4
 */
@Component
public class WebhookRecordServiceImpl implements WebhookRecordService {
    private WebhookRecordMapper webhookRecordMapper;
    private UserFeignClient userFeignClient;
    private WebHookValidator webHookValidator;

    public WebhookRecordServiceImpl(WebhookRecordMapper webhookRecordMapper,
                                    UserFeignClient userFeignClient,
                                    WebHookValidator webHookValidator) {
        this.webhookRecordMapper = webhookRecordMapper;
        this.userFeignClient = userFeignClient;
        this.webHookValidator = webHookValidator;
    }

    @Override
    public PageInfo<WebhookRecordDTO> pagingWebHookRecord(Pageable pageable, Long sourceId, Long webhookId, String status, String sendSettingCode, String webhookType, String source) {
        Long userId = DetailsHelper.getUserDetails().getUserId();
        webHookValidator.isOrgRootOrProjectOwner(userId, sourceId, source);
        PageInfo<WebhookRecordDTO> pageInfo = PageHelper.startPage(pageable.getPageNumber(), pageable.getPageSize(), PageableHelper.getSortSql(pageable.getSort())).
                doSelectPageInfo(() -> webhookRecordMapper.fulltextSearchPage(sourceId, webhookId, status, sendSettingCode, webhookType));

        return pageInfo;
    }

    @Override
    public WebhookRecordVO queryById(Long sourceId, Long id, String source) {
        Long userId = DetailsHelper.getUserDetails().getUserId();
        webHookValidator.isOrgRootOrProjectOwner(userId, sourceId, source);
        return webhookRecordMapper.queryRecordDetailById(id);
    }
}
