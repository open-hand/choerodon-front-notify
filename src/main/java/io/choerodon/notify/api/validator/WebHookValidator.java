package io.choerodon.notify.api.validator;

import io.choerodon.core.exception.CommonException;
import io.choerodon.notify.infra.feign.BaseFeignClient;
import org.springframework.stereotype.Component;

/**
 * User: Mr.Wang
 * Date: 2020/3/27
 */
@Component
public class WebHookValidator {
    private static final String PROJECT = "project";
    private static final String ORGANIZATION = "organization";
    private BaseFeignClient baseFeignClient;

    public WebHookValidator(BaseFeignClient baseFeignClient) {
        this.baseFeignClient = baseFeignClient;
    }

    public void isOrgRootOrProjectOwner(Long userId, Long sourceId, String source) {
        if (baseFeignClient.checkIsRoot(userId).getBody()) {
            return;
        }
        if (PROJECT.equals(source)) {
            if (baseFeignClient.checkIsOrgRoot(sourceId, userId).getBody()) {
                return;
            }
            if (!baseFeignClient.checkIsProjectOwner(userId, sourceId).getBody()) {
                throw new CommonException("user.not.project.owner");
            }
        }
        if (ORGANIZATION.equals(source)) {
            if (!baseFeignClient.checkIsOrgRoot(sourceId, userId).getBody()) {
                throw new CommonException("user.not.org.root");
            }
        }
    }
}
