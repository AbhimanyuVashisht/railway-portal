import React from "react";
import { Button } from 'semantic-ui-react';
import {
  withStyles,
} from "material-ui";

import headerLinksStyle from "assets/jss/material-dashboard-react/headerLinksStyle";

class HeaderLinks extends React.Component {
  state = {
    open: false
  };

  render() {
    return (
      <div>
          <Button color='red' onClick={() => {sessionStorage.clear('x-auth'); sessionStorage.clear('user'); window.location.reload()}} basic>Logout</Button>
      </div>
    );
  }
}

export default withStyles(headerLinksStyle)(HeaderLinks);
