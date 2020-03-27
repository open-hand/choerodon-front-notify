package io.choerodon.notify.api.service.impl;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.util.*;
import java.util.stream.Collectors;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.org.apache.regexp.internal.RE;
import freemarker.template.TemplateException;
import io.choerodon.core.notify.WebHookJsonSendDTO;
import io.choerodon.core.oauth.CustomUserDetails;
import io.choerodon.core.oauth.DetailsHelper;
import io.choerodon.notify.api.dto.SendSettingVO;
import io.choerodon.notify.api.dto.UserDTO;
import io.choerodon.notify.api.validator.WebHookValidator;
import io.choerodon.notify.infra.feign.BaseFeignClient;
import io.choerodon.notify.infra.mapper.*;
import org.apache.commons.lang.StringUtils;
import org.apache.tomcat.util.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.web.client.RestTemplate;

import io.choerodon.core.exception.CommonException;
import io.choerodon.core.exception.ext.InsertException;
import io.choerodon.core.exception.ext.NotExistedException;
import io.choerodon.core.exception.ext.UpdateException;
import io.choerodon.core.iam.ResourceLevel;
import io.choerodon.notify.api.dto.NoticeSendDTO;
import io.choerodon.notify.api.service.SendSettingService;
import io.choerodon.notify.api.service.TemplateService;
import io.choerodon.notify.api.service.WebHookMessageSettingService;
import io.choerodon.notify.api.service.WebHookService;
import io.choerodon.notify.api.vo.WebHookVO;
import io.choerodon.notify.infra.dto.*;
import io.choerodon.notify.infra.enums.RecordStatus;
import io.choerodon.notify.infra.enums.SendingTypeEnum;
import io.choerodon.notify.infra.enums.WebHookTypeEnum;
import io.choerodon.web.util.PageableHelper;
import tk.mybatis.mapper.util.StringUtil;

@Service
public class WebHookServiceImpl implements WebHookService {
    private static final Logger LOGGER = LoggerFactory.getLogger(WebHookServiceImpl.class);
    private static final String PROJECT = "project";
    private static final String ORGANIZATION = "organization";

    private static final String REQUEST_HEADER = "Content-Type:application/json";

    private WebHookMapper webHookMapper;
    private WebHookMessageSettingService webHookMessageSettingService;
    private TemplateService templateService;
    private SendSettingService sendSettingService;
    private TemplateRender templateRender;
    private WebhookRecordMapper webhookRecordMapper;
    private BaseFeignClient baseFeignClient;
    private WebhookRecordDetailMapper webhookRecordDetailMapper;
    private WebHookMessageSettingMapper webHookMessageSettingMapper;
    private SendSettingMapper sendSettingMapper;
    private WebHookValidator webHookValidator;

    public WebHookServiceImpl(WebHookMapper webHookMapper,
                              WebHookMessageSettingService webHookMessageSettingService,
                              TemplateService templateService,
                              SendSettingService sendSettingService,
                              TemplateRender templateRender,
                              WebhookRecordMapper webhookRecordMapper,
                              BaseFeignClient baseFeignClient,
                              WebhookRecordDetailMapper webhookRecordDetailMapper,
                              WebHookMessageSettingMapper webHookMessageSettingMapper,
                              SendSettingMapper sendSettingMapper,
                              WebHookValidator webHookValidator) {
        this.webHookMapper = webHookMapper;
        this.webHookMessageSettingService = webHookMessageSettingService;
        this.templateService = templateService;
        this.sendSettingService = sendSettingService;
        this.templateRender = templateRender;
        this.webhookRecordMapper = webhookRecordMapper;
        this.baseFeignClient = baseFeignClient;
        this.webhookRecordDetailMapper = webhookRecordDetailMapper;
        this.webHookMessageSettingMapper = webHookMessageSettingMapper;
        this.sendSettingMapper = sendSettingMapper;
        this.webHookValidator = webHookValidator;
    }

    @Override
    public void trySendWebHook(NoticeSendDTO dto, SendSettingDTO sendSetting, Set<String> mobiles) {
        LOGGER.info(">>>START_SENDING_WEB_HOOK>>> Send a web hook.[INFO:send_setting_code:'{}']", sendSetting.getCode());
        //0. 若发送设置非项目层 / 发送信息未指定项目Id 则取消发送
        if (!(ResourceLevel.PROJECT.value().equalsIgnoreCase(sendSetting.getLevel())
                || !ResourceLevel.ORGANIZATION.value().equalsIgnoreCase(sendSetting.getLevel()))
                || ObjectUtils.isEmpty(dto.getSourceId())
                || dto.getSourceId().equals(0L)) {
            LOGGER.warn(">>>CANCEL_SENDING_WEBHOOK>>> Missing project information.");
            return;
        }
        //2. 获取项目下配置该发送设置的WebHook
        Set<WebHookDTO> hooks = webHookMapper.selectBySendSetting(dto.getSourceId(), sendSetting.getId(), sendSetting.getLevel());
        if (CollectionUtils.isEmpty(hooks)) {
            LOGGER.info(">>>CANCEL_SENDING_WEBHOOK>>> The send settings have not been associated with webhook.");
            return;
        }

        //1. 获取该发送设置的WebHook模版
        Template template = null;


        //3. 发送WebHook
        WebhookRecordDTO webhookRecordDTO = new WebhookRecordDTO();
        WebhookRecordDetailDTO webhookRecordDetailDTO = new WebhookRecordDetailDTO();
        for (WebHookDTO hook : hooks) {
            Map<String, Object> userParams = dto.getParams();
            String content = null;
            //获取模板
            if (WebHookTypeEnum.WECHAT.getValue().equals(hook.getType()) || WebHookTypeEnum.DINGTALK.getValue().equals(hook.getType())) {
                try {
                    template = templateService.getOne(new Template()
                            .setSendingType(SendingTypeEnum.WHO.getValue())
                            .setSendSettingCode(sendSetting.getCode()));
                } catch (Exception e) {
                    LOGGER.warn(">>>CANCEL_SENDING_WEBHOOK>>> No valid templates available.", e);
                    return;
                }
            }
            if (WebHookTypeEnum.JSON.getValue().equals(hook.getType())) {
                try {
                    template = templateService.getOne(new Template()
                            .setSendingType(SendingTypeEnum.WHJ.getValue())
                            .setSendSettingCode(sendSetting.getCode()));
                } catch (Exception e) {
                    LOGGER.warn(">>>CANCEL_SENDING_WEBHOOK>>> No valid templates available.", e);
                    return;
                }
            }
            if (Objects.isNull(template)) {
                return;
            }
            try {
                content = templateRender.renderTemplate(template, userParams, TemplateRender.TemplateType.CONTENT);
            } catch (IOException e) {
                LOGGER.error(e.getMessage());
            } catch (TemplateException e) {
                LOGGER.error(e.getMessage());
            }
            if (WebHookTypeEnum.DINGTALK.getValue().equalsIgnoreCase(hook.getType())) {
                webhookRecordDTO.setWebhookPath(hook.getWebhookPath());
                webhookRecordDTO.setSourceId(hook.getSourceId());
                webhookRecordDTO.setSourceLevel(hook.getSourceLevel());
                webhookRecordDTO.setContent(content);
                webhookRecordDTO.setSendSettingCode(dto.getCode());
                String title = null;
                try {
                    title = templateRender.renderTemplate(template, userParams, TemplateRender.TemplateType.TITLE);
                } catch (IOException e) {
                    LOGGER.error(e.getMessage());
                } catch (TemplateException e) {
                    LOGGER.error(e.getMessage());
                }
                sendDingTalk(hook, content, title, mobiles, dto.getCode(), webhookRecordDetailDTO);
            } else if (WebHookTypeEnum.WECHAT.getValue().equalsIgnoreCase(hook.getType())) {
                webhookRecordDTO.setWebhookPath(hook.getWebhookPath());
                webhookRecordDTO.setSourceId(hook.getSourceId());
                webhookRecordDTO.setSourceLevel(hook.getSourceLevel());
                webhookRecordDTO.setContent(content);
                webhookRecordDTO.setSendSettingCode(dto.getCode());
                sendWeChat(hook, content, dto.getCode(), webhookRecordDetailDTO);
            } else if (WebHookTypeEnum.JSON.getValue().equalsIgnoreCase(hook.getType())) {
                webhookRecordDTO.setWebhookPath(hook.getWebhookPath());
                webhookRecordDTO.setSourceId(hook.getSourceId());
                webhookRecordDTO.setSourceLevel(hook.getSourceLevel());
                webhookRecordDTO.setContent(content);
                webhookRecordDTO.setSendSettingCode(dto.getCode());
                sendJson(hook, dto, webhookRecordDetailDTO);
            }
        }
    }


    /**
     * 触发钉钉的 WebHook 机器人
     * 钉钉的 WebHook 自定义机器人的配置文档：https://ding-doc.dingtalk.com/doc#/serverapi3/iydd5h
     *
     * @param hook  WebHook 配置
     * @param text  发送内容
     * @param title 发送主题
     */
    private void sendDingTalk(WebHookDTO hook, String text, String title, Set<String> mobiles, String code, WebhookRecordDetailDTO webhookRecordDetailDTO) {
        WebHookJsonSendDTO webHookJsonSendDTO = fillWebHookJson(code);
        WebhookRecordDTO webhookRecordDTO = fillWebhookRecordDTO(code, hook, text);
        Gson gson = new Gson();
        //组装重试时候的数据
        Map<String, Object> retryData = new HashMap<>();
        retryData.put("text", text);
        retryData.put("title", title);
        retryData.put("mobiles", mobiles);
        retryData.put("code", code);
        webhookRecordDetailDTO.setRetryData(JSON.toJSONString(retryData));

        RestTemplate template = new RestTemplate();

        WebhookRecordDTO updateRecordDTO = null;
        //如果是重试，查询记录
        if (!Objects.isNull(webhookRecordDetailDTO.getWebhookRecordId())) {
            if ((updateRecordDTO = webhookRecordMapper.selectByPrimaryKey(webhookRecordDetailDTO.getWebhookRecordId())) != null) {
                webhookRecordDTO.setId(webhookRecordDetailDTO.getWebhookRecordId());
                updateRecordDTO = webhookRecordMapper.selectByPrimaryKey(webhookRecordDetailDTO.getWebhookRecordId());
            }
        }
        ResponseEntity<String> response = null;
        Map<String, Object> request = new HashMap<>();
        try {
            //1.添加安全设置，构造请求uri（此处直接封装uri而非用String类型来进行http请求：RestTemplate 在执行请求时，如果路径为String类型，将分析路径参数并组合路径，此时会丢失sign的部分特殊字符）
            long timestamp = System.currentTimeMillis();
            URI uri = new URI(hook.getWebhookPath() + "&timestamp=" + timestamp + "&sign=" + addSignature(hook.getSecret(), timestamp));
            //2.添加发送类型
            request.put("msgtype", "markdown");
            //3.添加@对象
            Map<String, Object> at = new HashMap<>();
            at.put("isAtAll", CollectionUtils.isEmpty(mobiles));
            if (!CollectionUtils.isEmpty(mobiles)) {
                at.put("atMobiles", mobiles);
            }
            request.put("at", at);
            for (String mobile : mobiles) {
                text = "@" + mobile + text;
            }
            //4.添加发送内容
            Map<String, Object> markdown = new HashMap<>();
            markdown.put("text", text);
            markdown.put("title", title);
            request.put("markdown", markdown);
            //额外内容
            request.put("web_uri", uri);
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("requestBody", JSON.toJSONString(request));
            webHookJsonSendDTO.setObjectAttributes(jsonObject);
            //5.发送请求
            webhookRecordDTO.setSendTime(new Date());
            webhookRecordDetailDTO.setRequestHeaders(REQUEST_HEADER);
            webhookRecordDetailDTO.setRequestBody(webHookJsonSendDTO.getObjectAttributes().get("requestBody").toString());
            response = template.postForEntity(uri, request, String.class);
            webhookRecordDetailDTO.setResponseHeaders(JSON.toJSONString(response.getHeaders()));
            webhookRecordDetailDTO.setResponseBody(response.getBody());
            recordCompletedOrFailedLog(response, webhookRecordDTO, updateRecordDTO, webhookRecordDetailDTO);

        } catch (Exception e) {
            recordRunningLog(response, webhookRecordDTO, e, webhookRecordDetailDTO, webHookJsonSendDTO, updateRecordDTO);
            e.printStackTrace();
        }
    }

    private WebhookRecordDTO fillWebhookRecordDTO(String code, WebHookDTO hook, String text) {
        WebhookRecordDTO webhookRecordDTO = new WebhookRecordDTO();
        SendSettingDTO sendSettingDTO = new SendSettingDTO();
        SendSettingDTO settingDTO = sendSettingDTO.setCode(code);
        SendSettingDTO selectOne = sendSettingMapper.selectOne(settingDTO);
        webhookRecordDTO.setWebhookPath(hook.getWebhookPath());
        webhookRecordDTO.setSourceId(hook.getSourceId());
        webhookRecordDTO.setContent(text);
        webhookRecordDTO.setSendSettingCode(code);
        webhookRecordDTO.setWebhookId(hook.getId());
        webhookRecordDTO.setSourceLevel(selectOne.getLevel());
        return webhookRecordDTO;
    }

    private void recordRunningLog(ResponseEntity<String> response, WebhookRecordDTO webhookRecordDTO, Exception e,
                                  WebhookRecordDetailDTO webhookRecordDetailDTO, WebHookJsonSendDTO webHookJsonSendDTO, WebhookRecordDTO updateRecordDTO) {
        webhookRecordDTO.setStatus(RecordStatus.RUNNING.getValue());
        webhookRecordDTO.setFailedReason(e.getMessage());
        webhookRecordDTO.setEndTime(new Date());
        webhookRecordDetailDTO.setRequestHeaders(REQUEST_HEADER);
        webhookRecordDetailDTO.setRequestBody(webHookJsonSendDTO.getObjectAttributes().get("requestBody").toString());
        if (!Objects.isNull(response)) {
            webhookRecordDetailDTO.setResponseHeaders(JSON.toJSONString(response.getHeaders()));
            webhookRecordDetailDTO.setResponseBody(response.getBody());
        }
        if (!Objects.isNull(webhookRecordDTO.getId())) {
            webhookRecordDTO.setObjectVersionNumber(updateRecordDTO.getObjectVersionNumber());
            webhookRecordMapper.updateByPrimaryKeySelective(webhookRecordDTO);
            webhookRecordDetailDTO.setWebhookRecordId(webhookRecordDTO.getId());
            webhookRecordDetailMapper.updateByPrimaryKeySelective(webhookRecordDetailDTO);
        } else {
            webhookRecordMapper.insertSelective(webhookRecordDTO);
            webhookRecordDetailDTO.setWebhookRecordId(webhookRecordDTO.getId());
            webhookRecordDetailMapper.insertSelective(webhookRecordDetailDTO);
        }
    }

    private void recordCompletedOrFailedLog(ResponseEntity<String> response, WebhookRecordDTO webhookRecordDTO, WebhookRecordDTO updateRecordDTO, WebhookRecordDetailDTO webhookRecordDetailDTO) {
        if (!response.getStatusCode().is2xxSuccessful()) {
            LOGGER.warn(">>>SENDING_WEBHOOK_ERROR>>> Sending the web hook was not successful,response:{}", response);
            webhookRecordDTO.setStatus(RecordStatus.FAILED.getValue());
            webhookRecordDTO.setFailedReason(response.getBody());
            webhookRecordDTO.setEndTime(new Date());
            if (!Objects.isNull(webhookRecordDTO.getId())) {
                webhookRecordDTO.setObjectVersionNumber(updateRecordDTO.getObjectVersionNumber());
                webhookRecordMapper.updateByPrimaryKeySelective(webhookRecordDTO);
                webhookRecordDetailDTO.setWebhookRecordId(webhookRecordDTO.getId());
                webhookRecordDetailMapper.updateByPrimaryKeySelective(webhookRecordDetailDTO);
            } else {
                webhookRecordMapper.insertSelective(webhookRecordDTO);
                webhookRecordDetailDTO.setWebhookRecordId(webhookRecordDTO.getId());
                webhookRecordDetailMapper.insertSelective(webhookRecordDetailDTO);
            }
        } else {
            webhookRecordDTO.setStatus(RecordStatus.COMPLETE.getValue());
            webhookRecordDTO.setEndTime(new Date());
            if (!Objects.isNull(webhookRecordDTO.getId())) {
                webhookRecordDTO.setObjectVersionNumber(updateRecordDTO.getObjectVersionNumber());
                webhookRecordMapper.updateByPrimaryKeySelective(webhookRecordDTO);
                webhookRecordDetailDTO.setWebhookRecordId(webhookRecordDTO.getId());
                webhookRecordDetailMapper.updateByPrimaryKeySelective(webhookRecordDetailDTO);
            } else {
                webhookRecordMapper.insertSelective(webhookRecordDTO);
                webhookRecordDetailDTO.setWebhookRecordId(webhookRecordDTO.getId());
                webhookRecordDetailMapper.insertSelective(webhookRecordDetailDTO);
            }
        }
    }

    private WebHookJsonSendDTO fillWebHookJson(String code) {
        WebHookJsonSendDTO webHookJsonSendDTO = new WebHookJsonSendDTO(null, null, null, null, null);
        webHookJsonSendDTO.setCreatedAt(new Date());
        SendSettingVO sendSettingVO = sendSettingService.query(code);
        if (Objects.isNull(sendSettingVO)) {
            throw new CommonException("error.send.DingTalk.not.exist");
        }
        webHookJsonSendDTO.setEventName(sendSettingVO.getName());
        webHookJsonSendDTO.setObjectKind(code);
        WebHookJsonSendDTO.User user = new WebHookJsonSendDTO.User(null, null);
        CustomUserDetails userDetails = DetailsHelper.getUserDetails();

        List<UserDTO> userDTOS = baseFeignClient.listUsersByIds(new Long[]{userDetails.getUserId()}, true).getBody();
        if (CollectionUtils.isEmpty(userDTOS)) {
            throw new CommonException("error.execute.user.not.exist");
        }
        UserDTO userDTO = userDTOS.get(0);
        if (userDTO.getLdap()) {
            user.setLoginName(userDTO.getLoginName());
        } else {
            user.setLoginName(userDTO.getEmail());
        }
        user.setUserName(userDTO.getRealName());
        webHookJsonSendDTO.setUser(user);
        return webHookJsonSendDTO;
    }

    /**
     * 钉钉加签方法
     * 第一步，把timestamp+"\n"+密钥当做签名字符串，使用HmacSHA256算法计算签名，然后进行Base64 encode，最后再把签名参数再进行urlEncode，得到最终的签名（需要使用UTF-8字符集）
     *
     * @param secret
     * @param timestamp
     * @return
     */
    private String addSignature(String secret, Long timestamp) {
        //第一步，把timestamp+"\n"+密钥当做签名字符串
        String stringToSign = timestamp + "\n" + secret;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes("UTF-8"), "HmacSHA256"));
            byte[] signData = mac.doFinal(stringToSign.getBytes("UTF-8"));
            return URLEncoder.encode(new String(Base64.encodeBase64(signData)), "UTF-8");
        } catch (Exception e) {
            LOGGER.error(">>>SENDING_WEBHOOK_ERROR>>> An error occurred while adding the signature", e.getMessage());
            return null;
        }
    }

    private void sendWeChat(WebHookDTO hook, String content, String code, WebhookRecordDetailDTO webhookRecordDetailDTO) {
        WebHookJsonSendDTO webHookJsonSendDTO = fillWebHookJson(code);
        Gson gson = new Gson();
        Map<String, Object> retryData = new HashMap<>();
        retryData.put("content", content);
        retryData.put("code", code);
        webhookRecordDetailDTO.setRetryData(JSON.toJSONString(retryData));
        webhookRecordDetailDTO.setRequestHeaders(REQUEST_HEADER);
        RestTemplate template = new RestTemplate();
        Map<String, Object> request = new TreeMap<>();
        request.put("msgtype", "markdown");
        Map<String, Object> markdown = new TreeMap<>();
        markdown.put("content", content);
        request.put("markdown", markdown);
        WebhookRecordDTO webhookRecordDTO = fillWebhookRecordDTO(code, hook, content);
        webhookRecordDTO.setEndTime(new Date());
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("requestBody", JSON.toJSONString(request));
        webHookJsonSendDTO.setObjectAttributes(jsonObject);

        ResponseEntity<String> response = null;
        WebhookRecordDTO updateRecordDTO = new WebhookRecordDTO();
        if (!Objects.isNull(webhookRecordDetailDTO.getWebhookRecordId())) {
            if (webhookRecordMapper.selectByPrimaryKey(webhookRecordDetailDTO.getWebhookRecordId()) != null) {
                webhookRecordDTO.setId(webhookRecordDetailDTO.getWebhookRecordId());
                updateRecordDTO = webhookRecordMapper.selectByPrimaryKey(webhookRecordDetailDTO.getWebhookRecordId());
            }
        }
        try {
            webhookRecordDetailDTO.setRequestBody(webHookJsonSendDTO.getObjectAttributes().get("requestBody").toString());

            response = template.postForEntity(hook.getWebhookPath(), request, String.class);

            webhookRecordDetailDTO.setResponseHeaders(JSON.toJSONString(response.getHeaders().toString()));
            webhookRecordDetailDTO.setResponseBody(response.getBody());
            webhookRecordDTO.setWebhookPath(hook.getWebhookPath());
            webhookRecordDTO.setSourceId(hook.getSourceId());
            webhookRecordDTO.setContent(content);
            webhookRecordDTO.setSendSettingCode(code);
            webhookRecordDTO.setWebhookId(hook.getId());
            recordCompletedOrFailedLog(response, webhookRecordDTO, updateRecordDTO, webhookRecordDetailDTO);
        } catch (Exception e) {
            recordRunningLog(response, webhookRecordDTO, e, webhookRecordDetailDTO, webHookJsonSendDTO, updateRecordDTO);
            e.printStackTrace();
        }
    }

    private void sendJson(WebHookDTO hook, NoticeSendDTO dto, WebhookRecordDetailDTO webhookRecordDetailDTO) {
        WebHookJsonSendDTO webHookJsonSendDTO = fillWebHookJson(dto.getCode());
        Map<String, Object> retryData = new HashMap<>();
        retryData.put("dto", dto);
        webhookRecordDetailDTO.setRetryData(JSON.toJSONString(retryData));
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("requestBody", JSON.toJSONString(dto));
        webHookJsonSendDTO.setObjectAttributes(jsonObject);

        RestTemplate template = new RestTemplate();

        WebhookRecordDTO webhookRecordDTO = fillWebhookRecordDTO(dto.getCode(), hook, JSON.toJSONString(dto));
        webhookRecordDetailDTO.setRequestHeaders(REQUEST_HEADER);
        webhookRecordDTO.setSendTime(new Date());
        ResponseEntity<String> response = null;
        WebhookRecordDTO updateRecordDTO = new WebhookRecordDTO();

        webhookRecordDetailDTO.setRequestBody(webHookJsonSendDTO.getObjectAttributes().get("requestBody").toString());
        //如果是重试，查出记录
        if (!Objects.isNull(webhookRecordDetailDTO.getWebhookRecordId())) {
            if (webhookRecordMapper.selectByPrimaryKey(webhookRecordDetailDTO.getWebhookRecordId()) != null) {
                webhookRecordDTO.setId(webhookRecordDetailDTO.getWebhookRecordId());
                updateRecordDTO = webhookRecordMapper.selectByPrimaryKey(webhookRecordDetailDTO.getWebhookRecordId());
            }
        }
        try {
            response = template.postForEntity(hook.getWebhookPath(), dto, String.class);

            webhookRecordDetailDTO.setResponseHeaders(JSON.toJSONString(response.getHeaders()));
            webhookRecordDetailDTO.setResponseBody(JSON.toJSONString(response.getBody()));
            recordCompletedOrFailedLog(response, webhookRecordDTO, updateRecordDTO, webhookRecordDetailDTO);
        } catch (Exception e) {
            recordRunningLog(response, webhookRecordDTO, e, webhookRecordDetailDTO, webHookJsonSendDTO, updateRecordDTO);
            e.printStackTrace();
        }
    }

    @Override
    public PageInfo<WebHookDTO> pagingWebHook(Pageable pageable, Long sourceId, String sourceLevel, WebHookDTO filterDTO, String params) {
        return PageHelper.startPage(pageable.getPageNumber(), pageable.getPageSize(), PageableHelper.getSortSql(pageable.getSort()))
                .doSelectPageInfo(() -> webHookMapper.doFTR(sourceId, sourceLevel, filterDTO, params));
    }

    @Override
    public Boolean checkPath(Long id, String path) {
        if (StringUtils.isEmpty(path)) {
            throw new CommonException("error.web.hook.check.path.can.not.be.empty");
        }
        WebHookDTO existDTO = webHookMapper.selectOne(new WebHookDTO().setWebhookPath(path));
        return ObjectUtils.isEmpty(existDTO)
                || (!ObjectUtils.isEmpty(existDTO) && existDTO.getId().equals(id));
    }

    @Override
    public WebHookVO getById(Long projectId, Long id, String type) {
        //1.查询WebHookVO
        WebHookDTO webHookDTO = checkExistedById(id);
        WebHookVO webHookVO = new WebHookVO();
        BeanUtils.copyProperties(webHookDTO, webHookVO);
        //2.查询可选的发送设置
        webHookVO.setTriggerEventSelection(sendSettingService.getUnderProject(null, null, type));
        //3.查询已选的发送设置主键
        List<WebHookMessageSettingDTO> byWebHookId = webHookMessageSettingService.getByWebHookId(id);
        webHookVO.setSendSettingIdList(CollectionUtils.isEmpty(byWebHookId) ? null : byWebHookId.stream().map(WebHookMessageSettingDTO::getSendSettingId).collect(Collectors.toSet()));
        return webHookVO;
    }

    @Override
    @Transactional
    public WebHookVO create(Long sourceId, WebHookVO webHookVO, String source) {
        Long userId = DetailsHelper.getUserDetails().getUserId();
        //校验管理员权限
        webHookValidator.isOrgRootOrProjectOwner(userId, sourceId, source);
        webHookVO.setSourceId(sourceId);
        //校验type
        if (!WebHookTypeEnum.isInclude(webHookVO.getType())) {
            throw new CommonException("error.web.hook.type.invalid");
        }
        //0.校验web hook path
        if (!checkPath(null, webHookVO.getWebhookPath())) {
            throw new CommonException("error.web.hook.path.duplicate");
        }
        //1.新增WebHook
        webHookVO.setSourceLevel(source);

        Set<Long> sendSettingIdList = webHookVO.getSendSettingIdList();
        List<SendSettingDTO> sendSettingDTOS = new ArrayList<>();
        sendSettingIdList.stream().forEach(aLong -> {
            SendSettingDTO sendSettingDTO = sendSettingMapper.selectByPrimaryKey(aLong);
            if (!Objects.isNull(sendSettingDTO)) {
                sendSettingDTOS.add(sendSettingDTO);
            }
        });
        String collect = sendSettingDTOS.stream().
                map(SendSettingDTO::getName).collect(Collectors.joining(","));
        webHookVO.setName(collect);
        if (webHookMapper.insertSelective(webHookVO) != 1) {
            throw new InsertException("error.web.hook.insert");
        }
        //2.新增WebHook的发送设置配置
        webHookMessageSettingService.update(webHookVO.getId(), webHookVO.getSendSettingIdList());
        //3.返回数据
        return getById(sourceId, webHookVO.getId(), webHookVO.getType());
    }

    @Override
    @Transactional
    public WebHookVO update(Long projectId, WebHookVO webHookVO) {
        //0.校验web hook path
        if (!checkPath(webHookVO.getId(), webHookVO.getWebhookPath())) {
            throw new CommonException("error.web.hook.path.duplicate");
        }
        //1.更新WebHook
        WebHookDTO webHookDTO = checkExistedById(webHookVO.getId());

        Set<Long> sendSettingIdList = webHookVO.getSendSettingIdList();
        List<SendSettingDTO> sendSettingDTOS = new ArrayList<>();
        if (CollectionUtils.isEmpty(sendSettingIdList)) {
            webHookDTO.setName(null);
        } else {
            sendSettingIdList.stream().forEach(id -> {
                sendSettingDTOS.add(sendSettingMapper.selectByPrimaryKey(id));
            });
            webHookDTO.setName(sendSettingDTOS.stream().map(SendSettingDTO::getName).collect(Collectors.joining(",")));
        }
        webHookDTO.setObjectVersionNumber(webHookVO.getObjectVersionNumber());
        if (webHookMapper.updateByPrimaryKeySelective(webHookDTO
                .setSecret(webHookVO.getSecret())
                .setType(webHookVO.getType())
                .setWebhookPath(webHookVO.getWebhookPath())) != 1) {
            throw new UpdateException("error.web.hook.update");
        }
        //2.更新WebHook的发送设置配置
        webHookMessageSettingService.update(webHookDTO.getId(), webHookVO.getSendSettingIdList());
        //3.返回更新数据
        return getById(projectId, webHookDTO.getId(), webHookVO.getType());
    }


    @Override
    @Transactional
    public void delete(Long id) {
        //1.如 WebHook 不存在，则取消删除
        try {
            checkExistedById(id);
        } catch (NotExistedException e) {
            return;
        }
        //2.删除 WebHook
        if (webHookMapper.deleteByPrimaryKey(id) != 1) {
            throw new CommonException("error.web.hook.delete");
        }
        //3.删除 WebHook Message
        webHookMessageSettingService.deleteByWebHookId(id);
    }

    @Override
    public WebHookDTO disabled(Long id) {
        WebHookDTO webHookDTO = checkExistedById(id);
        if (webHookDTO.getEnableFlag() && webHookMapper.updateByPrimaryKeySelective(webHookDTO.setEnableFlag(false)) != 1) {
            throw new UpdateException("error.web.hook.disabled");
        }
        return webHookDTO;
    }

    @Override
    public WebHookDTO enabled(Long id) {
        WebHookDTO webHookDTO = checkExistedById(id);
        if (!webHookDTO.getEnableFlag() && webHookMapper.updateByPrimaryKeySelective(webHookDTO.setEnableFlag(true)) != 1) {
            throw new UpdateException("error.web.hook.enabled");
        }
        return webHookDTO;
    }

    @Override
    public void retry(Long sourceId, Long recordId, String source) {
        Long userId = DetailsHelper.getUserDetails().getUserId();
        webHookValidator.isOrgRootOrProjectOwner(userId, sourceId, source);
        WebhookRecordDTO webhookRecordDTO = webhookRecordMapper.selectByPrimaryKey(recordId);
        if (Objects.isNull(webhookRecordDTO)) {
            throw new CommonException("error.retry.webhook");
        }
        WebHookDTO webHookDTO = webHookMapper.selectByPrimaryKey(webhookRecordDTO.getWebhookId());
        if (Objects.isNull(webHookDTO)) {
            throw new CommonException("error.retry.webhook");
        }
        WebhookRecordDetailDTO condition = new WebhookRecordDetailDTO();
        condition.setWebhookRecordId(webhookRecordDTO.getId());
        webhookRecordDTO.setWebhookRecordDetailDTO(webhookRecordDetailMapper.selectOne(condition));
        if (WebHookTypeEnum.DINGTALK.getValue().equals(webHookDTO.getType())) {
            WebhookRecordDetailDTO webhookRecordDetailDTO = webhookRecordDTO.getWebhookRecordDetailDTO();
            Map<String, Object> retryData = (Map<String, Object>) JSONObject.parse(webhookRecordDetailDTO.getRetryData());
            String text = (String) retryData.get("text");
            String title = (String) retryData.get("title");
            Set<String> mobiles = new HashSet<>();
            if (Objects.isNull(retryData.get("mobiles"))) {
                mobiles = (Set<String>) retryData.get("mobiles");
            }
            String code = (String) retryData.get("code");
            sendDingTalk(webHookDTO, text, title, mobiles, code, webhookRecordDetailDTO);
        }
        if (WebHookTypeEnum.WECHAT.getValue().equals(webHookDTO.getType())) {
            WebhookRecordDetailDTO webhookRecordDetailDTO = webhookRecordDTO.getWebhookRecordDetailDTO();
            Map<String, Object> retryData = (Map<String, Object>) JSONObject.parse(webhookRecordDetailDTO.getRetryData());
            String content = (String) retryData.get("content");
            String code = (String) retryData.get("code");
            sendWeChat(webHookDTO, content, code, webhookRecordDetailDTO);
        }
        if (WebHookTypeEnum.JSON.getValue().equals(webHookDTO.getType())) {
            WebhookRecordDetailDTO webhookRecordDetailDTO = webhookRecordDTO.getWebhookRecordDetailDTO();
            Map<String, Object> retryData = (Map<String, Object>) JSONObject.parse(webhookRecordDetailDTO.getRetryData());
            NoticeSendDTO dto = (NoticeSendDTO) retryData.get("dto");
            sendJson(webHookDTO, dto, webhookRecordDetailDTO);
        }
    }

    @Override
    public void failure(Long sourceId, Long recordId, String source) {
        Long userId = DetailsHelper.getUserDetails().getUserId();
        webHookValidator.isOrgRootOrProjectOwner(userId, sourceId, source);
        WebhookRecordDTO webhookRecordDTO = webhookRecordMapper.selectByPrimaryKey(recordId);
        if (Objects.isNull(webhookRecordDTO) || !RecordStatus.RUNNING.getValue().equals(webhookRecordDTO.getStatus())) {
            throw new CommonException("error.project.force.failure");
        }
        webhookRecordDTO.setStatus(RecordStatus.FAILED.getValue());
        if (webhookRecordMapper.updateByPrimaryKeySelective(webhookRecordDTO) != 1) {
            throw new CommonException("error.project.force.failure");
        }
    }

    @Override
    public WebHookVO queryById(Long projectId, Long webHookId, String type) {
        WebHookVO webHookVO = getById(projectId, webHookId, type);
        return webHookVO;
    }

    /**
     * 根据主键校验WebHook是否存在
     *
     * @param id WebHook主键
     * @return WebHook
     */
    private WebHookDTO checkExistedById(Long id) {
        return Optional.ofNullable(webHookMapper.selectByPrimaryKey(id))
                .orElseThrow(() -> new NotExistedException("error.web.hook.does.not.existed"));
    }

    /**
     * 根据主键校验WebHookSetting是否存在
     *
     * @param id WebHook主键
     * @return WebHook
     */
    private WebHookMessageSettingDTO checkWebHookSettingExistedById(Long id) {
        return Optional.ofNullable(webHookMessageSettingMapper.selectByPrimaryKey(id))
                .orElseThrow(() -> new NotExistedException("error.web.hook.does.not.existed"));
    }

}
