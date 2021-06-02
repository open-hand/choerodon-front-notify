import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/boot';

const NO_HEADER = [];

export default function useStore() {
  return useLocalStore(() => ({
    navBounds: {},
    setNavBounds(data) {
      this.navBounds = data;
    },
    get getNavBounds() {
      return this.navBounds;
    },
    expandedKeys: [],
    setExpandedKeys(keys) {
      this.expandedKeys = keys;
    },
    get getExpandedKeys() {
      return this.expandedKeys.slice();
    },

    async loadTemplateDetail(templateId) {
      try {
        const res = await axios.get(`/hmsg/v1/message/templates/${templateId}`);
        if (res && !res.failed) {
          return res;
        }
        return false;
      } catch (e) {
        return false;
      }
    },
  }));
}
