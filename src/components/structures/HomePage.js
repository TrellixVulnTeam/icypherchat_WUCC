/*
Copyright 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

import React from 'react';
import MatrixClientPeg from 'matrix-react-sdk/lib/MatrixClientPeg';
import sdk from 'matrix-react-sdk';
import GeminiScrollbar from 'react-gemini-scrollbar';
import request from 'browser-request';

module.exports = React.createClass({
    displayName: 'HomePage',

    propTypes: {
        // URL base of the team server. Optional.
        teamServerUrl: React.PropTypes.string,
        // Team token. Optional. If set, used to get the static homepage of the team
        //      associated. If unset, homePageUrl will be used.
        teamToken: React.PropTypes.string,
        // URL to use as the iFrame src. Defaults to /home.html.
        homePageUrl: React.PropTypes.string,
    },

    getInitialState: function() {
        return {
            page: ""
        };
    },

    componentWillMount: function() {
        if (this.props.teamToken && this.props.teamServerUrl) {
            return;
        }

        // we use request() to inline the homepage into the react component
        // so that it can inherit CSS and theming easily rather than mess around
        // with iframes and trying to synchronise document.stylesheets.

        let src = this.props.homePageUrl || '/home.html';

        request(
            { method: "GET", url: src },
            (err, response, body) => {
                if (err || response.status < 200 || response.status >= 300) {
                    console.log(error);
                    this.setState({ page: "Couldn't load home page" });
                }

                // We parse the JSON ourselves rather than use the JSON
                // parameter, since this throws a parse error on empty
                // which breaks if there's no config.json and we're
                // loading from the filesystem (see above).
                this.setState({ page: body });
            }
        );
    },

    render: function() {
        if (this.props.teamToken && this.props.teamServerUrl) {
            src = `${this.props.teamServerUrl}/static/${this.props.teamToken}/home.html`;
            return (
                <div className="mx_HomePage">
                    <iframe src={ src } />
                </div>
            );
        }
        else {
            return (
                <GeminiScrollbar autoshow={true} className="mx_HomePage">
                    <div className="mx_HomePage_body" dangerouslySetInnerHTML={{ __html: this.state.page }}>
                    </div>
                </GeminiScrollbar>
            );
        }
    }
});
