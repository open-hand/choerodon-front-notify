package io.choerodon.notify.infra.feign.fallback;

import io.choerodon.core.exception.CommonException;
import io.choerodon.notify.api.dto.ProjectDTO;
import io.choerodon.notify.api.dto.UserDTO;
import io.choerodon.notify.infra.feign.BaseFeignClient;
import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * 〈功能简述〉
 * 〈〉
 *
 * @author wanghao
 * @Date 2019/12/11 19:04
 */
public class BaseFeignClientFallback implements BaseFeignClient {
    @Override
    public ResponseEntity<List<UserDTO>> listUsersByIds(Long[] ids, Boolean onlyEnabled) {
        return null;
    }

    @Override
    public ResponseEntity<Boolean> checkIsOrgRoot(Long organizationId, Long userId) {
        throw new CommonException("error.checkout.org.root");
    }

    @Override
    public ResponseEntity<Boolean> checkIsProjectOwner(Long id, Long projectId) {
        throw new CommonException("error.checkout.project.owner");
    }

    @Override
    public ResponseEntity<ProjectDTO> queryProjectById(Long projectId) {
        throw new CommonException("error.query.project");
    }

    @Override
    public ResponseEntity<Boolean> checkIsRoot(Long id) {
        throw new CommonException("error.check.root");
    }
}
