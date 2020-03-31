package io.choerodon.notify.infra.feign;

import io.choerodon.notify.api.dto.ProjectDTO;
import io.choerodon.notify.api.dto.UserDTO;
import io.choerodon.notify.infra.feign.fallback.BaseFeignClientFallback;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 〈功能简述〉
 * 〈base-service Fegin接口〉
 *
 * @author wanghao
 * @Date 2019/12/11 19:00
 */
@FeignClient(value = "base-service", fallback = BaseFeignClientFallback.class)
public interface BaseFeignClient {

    @PostMapping(value = "/v1/users/ids")
    ResponseEntity<List<UserDTO>> listUsersByIds(@RequestBody Long[] ids, @RequestParam(value = "only_enabled") Boolean onlyEnabled);

    @GetMapping("/v1/organizations/{organization_id}/users/{user_id}/check_is_root")
    ResponseEntity<Boolean> checkIsOrgRoot(@PathVariable(name = "organization_id") Long organizationId,
                                           @PathVariable(name = "user_id") Long userId);

    @GetMapping("/v1/users/{id}/projects/{project_id}/check_is_owner")
    ResponseEntity<Boolean> checkIsProjectOwner(@PathVariable("id") Long id,
                                                @PathVariable("project_id") Long projectId);

    @GetMapping("/v1/projects/{project_id}")
    ResponseEntity<ProjectDTO> queryProjectById(@PathVariable("project_id") Long projectId);

    @GetMapping("/v1/users/{id}/check_is_root")
    ResponseEntity<Boolean> checkIsRoot(@PathVariable("id") Long id);

}
