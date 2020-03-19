package io.choerodon.notify.api.controller.v1;

import com.github.pagehelper.PageInfo;
import io.choerodon.core.annotation.Permission;
import io.choerodon.core.enums.ResourceType;
import io.choerodon.notify.api.dto.WebhookRecordVO;
import io.choerodon.notify.api.service.WebhookRecordService;
import io.choerodon.notify.infra.dto.WebhookRecordDTO;
import io.choerodon.swagger.annotation.CustomPageRequest;
import io.swagger.annotations.ApiOperation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.SortDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

/**
 * @author jiameng.cao
 * @date 2019/11/4
 */
@RestController
@RequestMapping(value = "/v1/project/{project_id}/web_hook_records")
public class WebhookRecordProjectController {
    private WebhookRecordService webhookRecordService;

    public WebhookRecordProjectController(WebhookRecordService webhookRecordService) {
        this.webhookRecordService = webhookRecordService;
    }

    @GetMapping
    @Permission(type = ResourceType.SITE)
    @ApiOperation(value = "查询WebHook发送记录(分页接口)")
    @CustomPageRequest
    public ResponseEntity<PageInfo<WebhookRecordVO>> pagingByMessage(@ApiIgnore
                                                                     @SortDefault(value = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                                                     @PathVariable(name = "project_id") Long sourceId,
                                                                     @RequestParam(required = false, name = "source_level") String sourceLevel,
                                                                     @RequestParam(required = false) String status,
                                                                     @RequestParam(required = false, name = "send_setting_code") String sendSettingCode,
                                                                     @RequestParam(required = false, name = "webhook_type") String webhookType) {

        return new ResponseEntity<>(webhookRecordService.pagingWebHookRecord(pageable, sourceId, sourceLevel, status, sendSettingCode, webhookType), HttpStatus.OK);
    }

    @ApiOperation(value = "项目层查询WebHook发送记录详情")
    @GetMapping("/{id}")
    @Permission(type = ResourceType.PROJECT)
    public ResponseEntity<WebhookRecordVO> getWebhookRecordDeatils(
            @PathVariable(name = "project_id") Long projectId,
            @PathVariable(name = "id") Long id) {
        return new ResponseEntity<>(webhookRecordService.queryById(id), HttpStatus.OK);
    }

}
