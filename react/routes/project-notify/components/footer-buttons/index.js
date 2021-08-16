import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import './index.less';

const footerButtons = (props) => {
  const {
    onOk,
    onCancel,
  } = props;

  return (
    <div className="project-notify-buttons">
      <Button
        funcType="raised"
        onClick={onCancel}
        className="project-notify-buttons-right"
      ><FormattedMessage id="cancel" />
      </Button>
      <Button
        funcType="raised"
        color="primary"
        onClick={onOk}
      >
        <FormattedMessage id="save" />
      </Button>
    </div>
  );
};

footerButtons.propTypes = {
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default footerButtons;
