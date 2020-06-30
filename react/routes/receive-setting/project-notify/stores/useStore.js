import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/boot';

export default function useStore() {
  return useLocalStore(() => ({
    allowConfigData: [],

    spinning: false,

    get getSpinning() {
      return this.spinning;
    },

    setSpinning(data) {
      this.spinning = data;
    },

    get getAllowConfigData() {
      return this.allowConfigData;
    },

    setAllowConfigData(data) {
      this.allowConfigData = data;
    },

    receiveData: [],
    get getReceiveData() {
      return this.receiveData.slice();
    },
    setReceiveData(data) {
      this.receiveData = data;
    },

    pagination: {
      page: 1,
      total: 0,
    },

    get getPagination() {
      return this.pagination;
    },

    setPagination(data) {
      this.pagination = data;
    },

    projectData: [],
    get getProjectData() {
      return this.projectData.slice();
    },
    setProjectData(data) {
      this.projectData = data;
    },

    formatData() {
      const that = this;
      const data = this.getAllowConfigData;
      function initChecked(item, type, templateIdName, enabledName) {
        const hasTemplateId = item[templateIdName] && item[enabledName];
        const isCheck = hasTemplateId && !that.getReceiveData.some(({ sendSettingId, sourceId, sendingType }) => (
          sendSettingId === item.id && Number(item.sourceId.split('-')[0]) === sourceId && sendingType === type
        ));
        item[`${type}Disabled`] = !hasTemplateId;
        return isCheck;
      }

      const res = [...this.getProjectData];
      this.setPagination({
        page: this.getPagination.page,
        total: res.length,
      });
      const newData = [];
      const { page } = this.getPagination;
      res.slice(5 * (page - 1), 5 * page).forEach((project) => {
        const projectId = project.id;
        project.key = `${projectId}`;
        project.treeType = 'project';
        const newLists = data.map((item) => {
          const { id, parentId, sequenceId } = item;
          const children = { ...item };
          if (id) {
            children.key = `${projectId}-${parentId}-${id}`;
            children.sourceId = `${projectId}-${parentId}`;
            children.treeType = 'item';
            children.pm = initChecked(children, 'pm', 'pmTemplateId', 'pmEnabledFlag');
            children.email = initChecked(children, 'email', 'emailTemplateId', 'emailEnabledFlag');
          } else {
            children.key = `${projectId}-${sequenceId}`;
            children.sourceId = `${projectId}`;
            children.treeType = 'group';
          }
          return children;
        });
        newData.push(project, ...newLists);
      });
      return newData;
    },

    async loadReceiveData(organizationId) {
      try {
        const [receive, projects] = await axios.all([
          axios.get('hmsg/choerodon/v1/notices/receive_setting?source_type=project'),
          axios.get(`iam/choerodon/v1/users/${organizationId}/organization_project`),
        ]);
        if (receive && receive.failed) {
          Choerodon.prompt(receive.message);
        } else {
          this.setReceiveData(receive);
        }
        if (projects && projects.failed) {
          Choerodon.prompt(projects.message);
        } else {
          this.setProjectData(projects.projectList);
        }
      } catch (e) {
        Choerodon.handleResponseError(e);
      }
    },

  }));
}
