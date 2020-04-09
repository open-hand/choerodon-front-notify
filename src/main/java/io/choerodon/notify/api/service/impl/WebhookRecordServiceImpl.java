package io.choerodon.notify.api.service.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import io.choerodon.core.oauth.DetailsHelper;
import io.choerodon.notify.api.dto.OrganizationDTO;
import io.choerodon.notify.api.dto.ProjectDTO;
import io.choerodon.notify.api.dto.WebhookRecordVO;
import io.choerodon.notify.api.service.WebhookRecordService;
import io.choerodon.notify.api.validator.WebHookValidator;
import io.choerodon.notify.infra.dto.WebhookRecordDTO;
import io.choerodon.notify.infra.feign.UserFeignClient;
import io.choerodon.notify.infra.mapper.WebhookRecordMapper;
import io.choerodon.web.util.PageableHelper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * @author jiameng.cao
 * @date 2019/11/4
 */
@Component
public class WebhookRecordServiceImpl implements WebhookRecordService {
    private static final String PROJECT = "project";
    private static final String ORGANIZATION = "organization";
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
    public PageInfo<WebhookRecordDTO> pagingWebHookRecord(Pageable pageable, Long sourceId, Long webhookId, String status, String sendSettingName, String webhookType, String source) {
        Long userId = DetailsHelper.getUserDetails().getUserId();
        webHookValidator.isOrgRootOrProjectOwner(userId, sourceId, source);
        PageInfo<WebhookRecordDTO> pageInfo = PageHelper.startPage(pageable.getPageNumber(), pageable.getPageSize(), PageableHelper.getSortSql(pageable.getSort())).
                doSelectPageInfo(() -> webhookRecordMapper.fulltextSearchPage(sourceId, webhookId, status, sendSettingName, webhookType));

        return pageInfo;
    }

    @Override
    public PageInfo<WebhookRecordDTO> pagingWebHookRecord(Pageable pageable, WebhookRecordVO webhookRecordVO, String projectOrg) {
        List<Long> ids = new ArrayList<>();
        if (!Objects.isNull(projectOrg)) {
            List<Long> projectIds = userFeignClient.getProListByName(projectOrg).getBody();
            List<Long> orgIds = userFeignClient.getOrgListByName(projectOrg).getBody();
            ids.addAll(projectIds);
            ids.addAll(orgIds);
            if (CollectionUtils.isEmpty(ids)) {
                return new PageInfo<>();
            }
        }
        List<Long> finalIds = ids;
        PageInfo<WebhookRecordDTO> pageInfo = PageHelper.startPage(pageable.getPageNumber(), pageable.getPageSize(), PageableHelper.getSortSql(pageable.getSort())).
                doSelectPageInfo(() -> webhookRecordMapper.fulltextSearch(webhookRecordVO, finalIds));
        List<WebhookRecordDTO> list = pageInfo.getList();
        List<WebhookRecordDTO> webhookRecordDTOS = list.stream()
                .filter(webhookRecordDTO -> PROJECT.equals(webhookRecordDTO.getSourceLevel()))
                .collect(Collectors.toList());
        List<WebhookRecordDTO> webhookRecordDTOS1 = list.stream()
                .filter(webhookRecordDTO -> ORGANIZATION.equals(webhookRecordDTO.getSourceLevel()))
                .collect(Collectors.toList());

        Set<Long> proIds = webhookRecordDTOS.stream().map(WebhookRecordDTO::getSourceId).collect(Collectors.toSet());

        List<ProjectDTO> projectDTOS = userFeignClient.listProjectsByIds(proIds).getBody();
        if (!CollectionUtils.isEmpty(projectDTOS)) {
            webhookRecordDTOS.stream().forEach(webhookRecordDTO -> {
                for (ProjectDTO dto : projectDTOS) {
                    if (dto.getId().equals(webhookRecordDTO.getSourceId())) {
                        webhookRecordDTO.setSourceName(dto.getName());
                        break;
                    }
                }
            });
        }

        Set<Long> orgIds = webhookRecordDTOS1.stream().map(WebhookRecordDTO::getSourceId).collect(Collectors.toSet());
        List<OrganizationDTO> organizationDTOS = userFeignClient.listOrganizationsByIds(orgIds).getBody();
        if (!CollectionUtils.isEmpty(organizationDTOS)) {
            webhookRecordDTOS1.stream().forEach(webhookRecordDTO -> {
                for (OrganizationDTO dto : organizationDTOS) {
                    if (dto.getId().equals(webhookRecordDTO.getSourceId())) {
                        webhookRecordDTO.setSourceName(dto.getName());
                        break;
                    }
                }
            });
        }
        List<WebhookRecordDTO> webhookRecordDTOList = new ArrayList<>();
        webhookRecordDTOList.addAll(webhookRecordDTOS);
        webhookRecordDTOS.addAll(webhookRecordDTOS1);
        pageInfo.setList(webhookRecordDTOList);

        return pageInfo;
    }

    @Override
    public WebhookRecordVO queryById(Long sourceId, Long id, String source) {
        Long userId = DetailsHelper.getUserDetails().getUserId();
        webHookValidator.isOrgRootOrProjectOwner(userId, sourceId, source);
        return webhookRecordMapper.queryRecordDetailById(id);
    }
}
