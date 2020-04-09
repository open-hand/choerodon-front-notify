package io.choerodon.notify.api.controller.v1;

import com.github.pagehelper.PageInfo;
import io.choerodon.core.annotation.Permission;
import io.choerodon.core.enums.ResourceType;
import io.choerodon.notify.api.dto.RecordListDTO;
import io.choerodon.notify.api.dto.WebhookRecordVO;
import io.choerodon.notify.api.service.MessageRecordService;
import io.choerodon.notify.api.service.WebhookRecordService;
import io.choerodon.notify.domain.Record;
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


@RestController
@RequestMapping("v1/records")
public class MessageRecordSiteController {

    private MessageRecordService messageRecordService;

    private WebhookRecordService webhookRecordService;

    public MessageRecordSiteController(MessageRecordService messageRecordService,
                                       WebhookRecordService webhookRecordService) {
        this.messageRecordService = messageRecordService;
        this.webhookRecordService = webhookRecordService;
    }

    @Permission(type = ResourceType.SITE)
    @GetMapping("/emails")
    @ApiOperation(value = "查询邮件消息记录（分页接口）")
    @CustomPageRequest
    public ResponseEntity<PageInfo<RecordListDTO>> pageEmail(@ApiIgnore
                                                             @SortDefault(value = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                                             @RequestParam(required = false) String status,
                                                             @RequestParam(required = false) String receiveEmail,
                                                             @RequestParam(required = false) String templateType,
                                                             @RequestParam(required = false) String failedReason,
                                                             @RequestParam(required = false) String params) {
        return new ResponseEntity<>(messageRecordService.pageEmail(status, receiveEmail, templateType, failedReason, params, pageable, null), HttpStatus.OK);
    }

    @Permission(type = ResourceType.SITE)
    @PostMapping("/emails/{id}/retry")
    @ApiOperation(value = "重试发送邮件")
    public Record manualRetrySendEmail(@PathVariable long id) {
        return messageRecordService.manualRetrySendEmail(id);
    }

    @Permission(type = ResourceType.SITE)
    @PostMapping("/web_hook_records")
    @ApiOperation(value = "查询WebHook发送记录(分页接口)")
    @CustomPageRequest
    public ResponseEntity<PageInfo<WebhookRecordDTO>> pagingByMessage(@ApiIgnore
                                                                      @SortDefault(value = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                                                      @RequestBody WebhookRecordVO webhookRecordVO,
                                                                      @RequestParam(required = false, name = "project_org") String projectOrg) {

        return new ResponseEntity<>(webhookRecordService.pagingWebHookRecord(pageable, webhookRecordVO, projectOrg), HttpStatus.OK);
    }
}
