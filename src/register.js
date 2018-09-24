import React from "react";
import PropTypes from "prop-types";
import addons from "@storybook/addons";
import { ADDON_ID, PANEL_ID, EVENT_ID } from "./shared";

export class ZeplinPanel extends React.Component {
  static initialState = {
    embedHost: "storybook",
    url: null,
    allowFullScreen: true
  };
  static propTypes = {
    channel: PropTypes.object,
    api: PropTypes.object
  };
  static defaultProps = {
    channel: {},
    api: {}
  };

  constructor(...args) {
    super(...args);
    this.state = {
      ...ZeplinPanel.initialState
    };
    this.onAddFigma = this.onAddFigma.bind(this);
  }

  componentDidMount() {
    const { channel, api } = this.props;
    channel.on(EVENT_ID, this.onAddFigma);

    this.stopListeningOnStory = api.onStory(() => {
      this.onAddFigma({ ...ZeplinPanel.initialState });
    });
  }

  componentWillUnmount() {
    if (this.stopListeningOnStory) {
      this.stopListeningOnStory();
    }

    this.unmounted = true;
    const { channel } = this.props;
    channel.removeListener(EVENT_ID, this.onAddFigma);
  }

  onAddFigma({
    url,
    embedHost = ZeplinPanel.initialState.embedHost,
    allowFullScreen = ZeplinPanel.initialState.allowFullScreen
  }) {
    this.setState({
      url,
      embedHost,
      allowFullScreen
    });
  }

  render() {
    const { url, allowFullScreen, embedHost } = this.state;

    if (!url) {
      return (
        <div
          style={{
            margin: "1rem",
            fontFamily: "Arial",
            fontSize: "1rem",
            color: "#444",
            width: "100%",
            overflow: "auto"
          }}
        >
          <strong>Oh Hey! 👋 Add a Figma design to your story:</strong>
          <pre>
            {`
          import React from 'react'
          import { storiesOf } from '@storybook/react'
          import { WithZeplin } from 'storybook-addon-zeplin'

          storiesOf('Button', module)
            .add('default', () => (
              <WithZeplin
                url={'https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File'}
              >
                <button>Hello</button>
              </WithZeplin>
            ))`}
          </pre>
        </div>
      );
    }
    return (
      <iframe
        height="100%"
        width="100%"
        frameBorder="0"
        src={`https://www.figma.com/embed?embed_host=${embedHost}&url=${url}`}
        allowFullScreen={allowFullScreen}
      />
    );
  }
}

addons.register(ADDON_ID, api => {
  addons.addPanel(PANEL_ID, {
    title: "Figma",
    render: () => <ZeplinPanel channel={addons.getChannel()} api={api} />
  });
});
