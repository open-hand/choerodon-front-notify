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
 * @author lrc
 * @since 2019/10/28
 */
@RestController
@RequestMapping
public class WebHookController {
    private static final String PROJECT = "project";
    private static final String ORGANIZATION = "organiaztion";
    private WebHookService webHookService;

    public WebHookController(WebHookService webHookService) {
        this.webHookService = webHookService;
    }

    @GetMapping("/v1/projects/{project_id}/web_hooks")
    @Permission(type = ResourceType.PROJECT)
    @ApiOperation(value = "查询WebHook信息（分页接口）")
    @CustomPageRequest
    public ResponseEntity<PageInfo<WebHookDTO>> pagingByMessage(@ApiIgnore
                                                                @SortDefault(value = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                                                @PathVariable(name = "project_id") Long projectId,
                                                                @RequestParam(required = false) String name,
                                                                @RequestParam(required = false) String type,
                                                                @RequestParam(required = false) Boolean enableFlag,
                                                                @RequestParam(required = false) String params) {
        WebHookDTO filterDTO = new WebHookDTO().setEnableFlag(enableFlag).setName(name).setType(type);
        return new ResponseEntity<>(webHookService.pagingWebHook(pageable, projectId, filterDTO, params), HttpStatus.OK);
    }

    @GetMapping("/v1/projects/{project_id}/web_hooks/check_path")
    @Permission(type = ResourceType.PROJECT)
    @ApiOperation(value = "校验WebHook地址是否已经存在")
    public ResponseEntity<Boolean> check(@RequestParam(value = "id", required = false) Long id,
                                         @RequestParam("path") String path) {
        return new ResponseEntity<>(webHookService.checkPath(id, path), HttpStatus.OK);
    }

//    @Permission(type = ResourceType.PROJECT)
//    @ApiOperation(value = "查询WebHook详情")
//    @GetMapping("/v1/projects/{project_id}/web_hooks/{id}")
//    public ResponseEntity<WebHookVO> getOne(@PathVariable(name = "project_id") Long projectId,
//                                            @PathVariable("id") Long id) {
//        return new ResponseEntity<>(webHookService.getById(projectId, id), HttpStatus.OK);
//    }


    @Permission(type = ResourceType.PROJECT)
    @ApiOperation(value = "项目层新增WebHook")
    @PostMapping("/v1/projects/{project_id}/web_hooks")
    public ResponseEntity<WebHookVO> createInProject(@PathVariable(name = "project_id") Long projectId,
                                                     @RequestBody @Validated WebHookVO webHookVO) {
        return new ResponseEntity<>(webHookService.create(projectId, webHookVO, PROJECT), HttpStatus.OK);
    }

    @Permission(type = ResourceType.PROJECT)
    @ApiOperation(value = "组织层新增WebHook")
    @PostMapping("/v1/organization/{organization_id}/web_hooks")
    public ResponseEntity<WebHookVO> createInOrg(@PathVariable(name = "organization_id") Long organizationId,
                                                 @RequestBody @Validated WebHookVO webHookVO) {
        return new ResponseEntity<>(webHookService.create(organizationId, webHookVO, ORGANIZATION), HttpStatus.OK);
    }


    @Permission(type = ResourceType.PROJECT)
    @ApiOperation(value = "更新WebHook")
    @PutMapping("/v1/projects/{project_id}/web_hooks/{id}")
    public ResponseEntity<WebHookVO> update(@PathVariable("project_id") Long projectId,
                                            @PathVariable("id") Long id,
                                            @RequestBody @Validated WebHookVO webHookVO) {
        webHookVO.setSourceId(projectId);
        //校验type
        if (!WebHookTypeEnum.isInclude(webHookVO.getType())) {
            throw new CommonException("error.web.hook.type.invalid");
        }
        return new ResponseEntity<>(webHookService.update(projectId, webHookVO), HttpStatus.OK);
    }

    @Permission(type = ResourceType.PROJECT)
    @ApiOperation(value = "删除WebHook")
    @DeleteMapping("/v1/projects/{project_id}/web_hooks/{id}")
    public ResponseEntity delete(@PathVariable("id") Long id) {
        webHookService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Permission(type = ResourceType.PROJECT)
    @ApiOperation(value = "禁用WebHook")
    @PutMapping("/v1/projects/{project_id}/web_hooks/{id}/disabled")
    public ResponseEntity<WebHookDTO> disabled(@PathVariable("id") Long id) {
        return new ResponseEntity<>(webHookService.disabled(id), HttpStatus.OK);
    }

    @Permission(type = ResourceType.PROJECT)
    @ApiOperation(value = "启用WebHook")
    @PutMapping("/v1/projects/{project_id}/web_hooks/{id}/enabled")
    public ResponseEntity<WebHookDTO> enabled(@PathVariable("id") Long id) {
        return new ResponseEntity<>(webHookService.enabled(id), HttpStatus.OK);
    }

    @Permission(type = ResourceType.PROJECT)
    @ApiOperation(value = "重试发送记录")
    @PostMapping("/v1/notifu/{source_id}/web_hooks/{id}/retry")
    public void retey(
            @PathVariable("source_id") Long sourceId,
            @PathVariable("id") Long id) {
        webHookService.retry(id, sourceId);
    }
//
//    @Permission(type = ResourceType.PROJECT)
//    @ApiOperation(value = "查询执行记录详情")
//    @GetMapping("/v1/projects/{project_id}/web_hooks/{id}")
//    public ResponseEntity<WebHookVO> getOne(@PathVariable(name = "project_id") Long projectId,
//                                            @PathVariable("id") Long id) {
//        return new ResponseEntity<>(webHookService.getById(projectId, id), HttpStatus.OK);
//    }
}
