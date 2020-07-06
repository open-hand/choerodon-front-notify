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
  }));
}
