package io.choerodon.notify.websocket.relationship;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketSession;

import io.choerodon.notify.api.service.WebSocketSendService;
import io.choerodon.notify.websocket.register.RedisChannelRegister;

public class DefaultRelationshipDefining implements RelationshipDefining {

    private static final Logger LOGGER = LoggerFactory.getLogger(RelationshipDefining.class);

    private Map<String, Set<WebSocketSession>> keySessionsMap = new ConcurrentHashMap<>();
    private static final String SIT_MSG_KEY_PATH = "choerodon:msg:{code}:{id}";
    private static final String SITE_MSG_CODE = "site-msg";
    private final AntPathMatcher matcher = new AntPathMatcher();

    private Map<WebSocketSession, Set<String>> sessionKeysMap = new ConcurrentHashMap<>();

    private StringRedisTemplate redisTemplate;

    private RedisChannelRegister redisChannelRegister;

    private static final String NUMBER_OF_VISITORS_TODAY = "NumberOfVisitorsToday";

    private static final String ONLINE_COUNT = "OnlineCount";

    @Autowired
    private WebSocketSendService webSocketWsSendService;

    public DefaultRelationshipDefining(StringRedisTemplate redisTemplate,
                                       RedisChannelRegister redisChannelRegister) {
        this.redisTemplate = redisTemplate;
        this.redisChannelRegister = redisChannelRegister;
    }


    @Override
    public Set<WebSocketSession> getWebSocketSessionsByKey(String key) {
        return keySessionsMap.getOrDefault(key, Collections.emptySet());
    }

    @Override
    public Set<String> getKeysBySession(WebSocketSession session) {
        return sessionKeysMap.getOrDefault(session, Collections.emptySet());
    }

    @Override
    public Set<String> getRedisChannelsByKey(String key, boolean exceptSelf) {
        Set<String> set = new HashSet<>();
        Set<String> survivalChannels = redisChannelRegister.getSurvivalChannels();
        if (exceptSelf) {
            survivalChannels.remove(redisChannelRegister.channelName());
        }
        survivalChannels.forEach(t -> {
            if (redisTemplate.opsForSet().members(t).contains(key)) {
                set.add(t);
            }
        });
        return set;
    }

    @Override
    public void contact(String key, WebSocketSession session) {
        if (StringUtils.isEmpty(key)) {
            return;
        }
        if (session != null) {
            Set<WebSocketSession> sessions = keySessionsMap.computeIfAbsent(key, k -> new HashSet<>());
            sessions.add(session);
            Set<String> subKeys = sessionKeysMap.computeIfAbsent(session, k -> new HashSet<>());
            subKeys.add(key);
            LOGGER.info("webSocket subscribe sessionId is {}, subKeys is {}", session.getId(), subKeys);
        }
        redisTemplate.opsForSet().add(redisChannelRegister.channelName(), key);
    }

    @Override
    public void removeWebSocketSessionContact(WebSocketSession delSession) {
        if (delSession == null) {
            return;
        }
        sessionKeysMap.remove(delSession);
        Iterator<Map.Entry<String, Set<WebSocketSession>>> it = keySessionsMap.entrySet().iterator();
        //获取用户Id
        keySessionsMap.forEach((k, v) -> {
            String userId = "";
            if (matcher.match(SIT_MSG_KEY_PATH, k)) {
                Map<String, String> map = matcher.extractUriTemplateVariables(SIT_MSG_KEY_PATH, k);
                String code = map.get("code");
                if (SITE_MSG_CODE.equals(code)) {
                    userId = map.get("id");
                }
            }
            //在线人数-1,发消息
            subOnlineCount(userId, delSession.getId());
            LOGGER.info("webSocket disconnect,delete user:{}'s sessionId:{}", userId, delSession.getId());
            webSocketWsSendService.sendVisitorsInfo(getOnlineCount(), getNumberOfVisitorsToday());
        });


        while (it.hasNext()) {
            Map.Entry<String, Set<WebSocketSession>> next = it.next();
            Set<WebSocketSession> sessions = next.getValue();
            sessions.removeIf(t -> t.equals(delSession));
            if (sessions.isEmpty()) {
                it.remove();
                redisTemplate.opsForSet().remove(redisChannelRegister.channelName(), next.getKey());
            }
        }

    }


    public synchronized Integer getOnlineCount() {
        return redisTemplate.keys(ONLINE_COUNT + "*").size();
    }

    public synchronized void addOnlineCount(String id, String sessionId) {
        redisTemplate.opsForSet().add(ONLINE_COUNT + ":" + id, sessionId);
    }

    public synchronized void subOnlineCount(String id, String sessionId) {
        redisTemplate.opsForSet().remove(ONLINE_COUNT + ":" + id, sessionId);

    }

    public synchronized void clearOnlineCount() {
        redisTemplate.delete(redisTemplate.keys(ONLINE_COUNT + "*"));
    }


    public synchronized Integer getNumberOfVisitorsToday() {
        return redisTemplate.opsForSet().members(NUMBER_OF_VISITORS_TODAY).size();
    }

    public synchronized void addNumberOfVisitorsToday(String id) {
        redisTemplate.opsForSet().add(NUMBER_OF_VISITORS_TODAY, id);
    }

    public synchronized void clearNumberOfVisitorsToday() {
        redisTemplate.delete(NUMBER_OF_VISITORS_TODAY);
    }
}
