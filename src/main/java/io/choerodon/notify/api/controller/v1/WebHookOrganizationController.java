package io.choerodon.notify.api.controller.v1;

import com.github.pagehelper.PageInfo;
import io.choerodon.core.annotation.Permission;
import io.choerodon.core.enums.ResourceType;
import io.choerodon.core.exception.CommonException;
import io.choerodon.notify.api.service.WebHookService;
import io.choerodon.notify.api.vo.WebHookVO;
import io.choerodon.notify.infra.dto.WebHookDTO;
import io.choerodon.notify.infra.enums.WebHookTypeEnum;
import io.choerodon.swagger.annotation.CustomPageRequest;
import io.swagger.annotations.ApiOperation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.SortDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

/**
 * User: Mr.Wang
 * Date: 2020/3/18
 */
@RestController
@RequestMapping("/v1/organization/{organization_id}")
public class WebHookOrganizationController {
    private static final String PROJECT = "project";
    private static final String ORGANIZATION = "organization";
    private WebHookService webHookService;

    public WebHookOrganizationController(WebHookService webHookService) {
        this.webHookService = webHookService;
    }

    @GetMapping("/web_hooks")
    @Permission(type = ResourceType.ORGANIZATION)
    @ApiOperation(value = "查询WebHook信息（分页接口）")
    @CustomPageRequest
    public ResponseEntity<PageInfo<WebHookDTO>> pagingByMessage(@ApiIgnore
                                                                @SortDefault(value = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                                                @PathVariable(name = "organization_id") Long sourceId,
                                                                @RequestParam(required = true) String sourceLevel,
                                                                @RequestParam(required = false) String name,
                                                                @RequestParam(required = false) String type,
                                                                @RequestParam(required = false) Boolean enableFlag,
                                                                @RequestParam(required = false) String params) {
        WebHookDTO filterDTO = new WebHookDTO().setEnableFlag(enableFlag).setName(name).setType(type);
        return new ResponseEntity<>(webHookService.pagingWebHook(pageable, sourceId, sourceLevel, filterDTO, params), HttpStatus.OK);
    }

    @GetMapping("/web_hooks/check_path")
    @Permission(type = ResourceType.ORGANIZATION)
    @ApiOperation(value = "校验WebHook地址是否已经存在")
    public ResponseEntity<Boolean> check(
            @PathVariable(name = "organization_id") Long organizationId,
            @RequestParam(value = "id", required = false) Long id,
            @RequestParam("path") String path) {
        return new ResponseEntity<>(webHookService.checkPath(id, path), HttpStatus.OK);
    }

    @Permission(type = ResourceType.ORGANIZATION)
    @ApiOperation(value = "组织层新增WebHook")
    @PostMapping("/web_hooks")
    public ResponseEntity<WebHookVO> createInOrg(@PathVariable(name = "organization_id") Long organizationId,
                                                 @RequestBody @Validated WebHookVO webHookVO) {
        return new ResponseEntity<>(webHookService.create(organizationId, webHookVO, ORGANIZATION), HttpStatus.OK);
    }

    @Permission(type = ResourceType.ORGANIZATION)
    @ApiOperation(value = "更新WebHook")
    @PutMapping("/web_hooks/{id}")
    public ResponseEntity<WebHookVO> update(@PathVariable("organization_id") Long organizationId,
                                            @PathVariable("id") Long id,
                                            @RequestBody @Validated WebHookVO webHookVO) {
        webHookVO.setSourceId(organizationId);
        //校验type
        if (!WebHookTypeEnum.isInclude(webHookVO.getType())) {
            throw new CommonException("error.web.hook.type.invalid");
        }
        return new ResponseEntity<>(webHookService.update(organizationId, ORGANIZATION, webHookVO), HttpStatus.OK);
    }


    @Permission(type = ResourceType.ORGANIZATION)
    @ApiOperation(value = "删除WebHook")
    @DeleteMapping("/web_hooks/{id}")
    public ResponseEntity delete(
            @PathVariable("organization_id") Long organizationId,
            @PathVariable("id") Long id) {
        webHookService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Permission(type = ResourceType.ORGANIZATION)
    @ApiOperation(value = "禁用WebHook")
    @PutMapping("/web_hooks/{id}/disabled")
    public ResponseEntity<WebHookDTO> disabled(
            @PathVariable("organization_id") Long organizationId,
            @PathVariable("id") Long id) {
        return new ResponseEntity<>(webHookService.disabled(id), HttpStatus.OK);
    }

    @Permission(type = ResourceType.ORGANIZATION)
    @ApiOperation(value = "启用WebHook")
    @PutMapping("/web_hooks/{id}/enabled")
    public ResponseEntity<WebHookDTO> enabled(
            @PathVariable("organization_id") Long organizationId,
            @PathVariable("id") Long id) {
        return new ResponseEntity<>(webHookService.enabled(id), HttpStatus.OK);
    }


    @Permission(type = ResourceType.ORGANIZATION)
    @ApiOperation(value = "组织层重试发送记录")
    @GetMapping("/{record_id}/retry")
    public void retey(
            @PathVariable("organization_id") Long organizationId,
            @PathVariable("record_id") Long recordId) {
        webHookService.retry(organizationId, recordId, ORGANIZATION);
    }

    @Permission(type = ResourceType.ORGANIZATION)
    @ApiOperation(value = "组织层强制失败")
    @GetMapping("/{record_id}/force/failure")
    public void failure(
            @PathVariable("organization_id") Long organizationId,
            @PathVariable("record_id") Long recordId) {
        webHookService.failure(organizationId, recordId, ORGANIZATION);
    }

    @Permission(type = ResourceType.ORGANIZATION)
    @ApiOperation(value = "根据ID查询webhook")
    @GetMapping("/{web_hook_id}")
    public ResponseEntity<WebHookVO> queryById(
            @PathVariable("organization_id") Long organizationId,
            @PathVariable("web_hook_id") Long webHookId,
            @RequestParam(required = false) String type) {
        return new ResponseEntity<>(webHookService.queryById(organizationId,ORGANIZATION, webHookId, type), HttpStatus.OK);
    }

}
