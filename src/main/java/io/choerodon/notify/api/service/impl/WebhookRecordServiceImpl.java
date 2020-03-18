package io.choerodon.notify.api.service.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import io.choerodon.notify.api.dto.ProjectDTO;
import io.choerodon.notify.api.dto.WebhookRecordVO;
import io.choerodon.notify.api.service.WebhookRecordService;
import io.choerodon.notify.infra.feign.UserFeignClient;
import io.choerodon.notify.infra.mapper.WebhookRecordMapper;
import io.choerodon.web.util.PageableHelper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @author jiameng.cao
 * @date 2019/11/4
 */
@Component
public class WebhookRecordServiceImpl implements WebhookRecordService {
    private WebhookRecordMapper webhookRecordMapper;
    private UserFeignClient userFeignClient;

    public WebhookRecordServiceImpl(WebhookRecordMapper webhookRecordMapper, UserFeignClient userFeignClient) {
        this.webhookRecordMapper = webhookRecordMapper;
        this.userFeignClient = userFeignClient;
    }

    @Override
    public PageInfo<WebhookRecordVO> pagingWebHookRecord(Pageable pageable, Long sourceId, String sourceLevel, String status, String sendSettingCode, String webhookType) {
        PageInfo<WebhookRecordVO> pageInfo = PageHelper.startPage(pageable.getPageNumber(), pageable.getPageSize(), PageableHelper.getSortSql(pageable.getSort())).
                doSelectPageInfo(() -> webhookRecordMapper.fulltextSearch(sourceId, sourceLevel, status, sendSettingCode, webhookType));
        return pageInfo;
    }

    @Override
    public WebhookRecordVO queryById(Long id) {
        return null;
    }
}
