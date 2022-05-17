import { set } from '@choerodon/inject';

set('notify:msgDetails', () => import('./routes/global/msg-record/msg-email/components/msg-details'));
