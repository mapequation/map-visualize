import PropTypes from "prop-types";
import React from "react";
import { Container, Divider, Icon, Progress, Segment, Step } from "semantic-ui-react";
import Background from "./Background.svg";
import Documentation from "./Documentation";
import Header from "./Header";
import parseFTree from "./lib/file-formats/ftree";
import networkFromFTree from "./lib/file-formats/network-from-ftree";
import parseFile from "./lib/parse-file";


class FileDialog extends React.Component {
    state = {
        progressVisible: false,
        progressLabel: "",
        progressValue: 0,
        progressError: false,
    };

    static propTypes = {
        onFileLoaded: PropTypes.func.isRequired,
    };

    progressTimeout = null;

    errorState = err => ({
        progressError: true,
        progressLabel: err.toString(),
    });

    componentWillUnmount() {
        clearTimeout(this.progressTimeout);
    }

    loadNetwork = (file, name) => {
        if (!name && file.name) {
            name = file.name;
        }

        this.setState({
            progressVisible: true,
            progressValue: 1,
            progressLabel: "Reading file",
            progressError: false,
        });

        this.progressTimeout = setTimeout(() =>
            this.setState({
                progressValue: 2,
                progressLabel: "Parsing",
            }), 400);

        return parseFile(file)
            .then((parsed) => {
                clearTimeout(this.progressTimeout);

                if (parsed.errors.length) {
                    throw new Error(parsed.errors[0].message);
                }

                const ftree = parseFTree(parsed.data);

                if (ftree.errors.length) {
                    throw new Error(ftree.errors[0]);
                }

                const network = networkFromFTree(ftree);

                this.setState({
                    progressValue: 3,
                    progressLabel: "Success",
                });

                this.progressTimeout = setTimeout(() => {
                    this.setState({ progressVisible: false });
                    this.props.onFileLoaded({ network, filename: name });
                }, 200);
            })
            .catch((err) => {
                clearTimeout(this.progressTimeout);
                this.setState(this.errorState(err));
                console.log(err);
            });
    };

    loadExampleData = () => {
        const filename = "citation_data.ftree";

        this.setState({
            progressVisible: true,
            progressValue: 1,
            progressLabel: "Reading file",
            progressError: false,
        });

        fetch(filename)
            .then(res => res.text())
            .then(file => this.loadNetwork(file, filename))
            .catch((err) => {
                this.setState(this.errorState(err));
                console.log(err);
            });
    };

    render() {
        const { progressError, progressLabel, progressValue, progressVisible } = this.state;

        const background = {
            background: `linear-gradient(hsla(0, 0%, 100%, 0.5), hsla(0, 0%, 100%, 0.5)), url(${Background}) no-repeat`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
        };

        return (
            <React.Fragment>
                <Header/>
                <div style={{ padding: "100px 0 100px 0", ...background }}>
                    <Segment
                        as={Container}
                        text
                        textAlign="center"
                        style={{ padding: "50px 0px" }}
                        padded='very'
                    >

                        <Step.Group>
                            <Step link onClick={this.loadExampleData}>
                                <Icon name="book"/>
                                <Step.Content>
                                    <Step.Title>Load example</Step.Title>
                                    <Step.Description>Citation network</Step.Description>
                                </Step.Content>
                            </Step>
                        </Step.Group>

                        <Divider horizontal style={{ margin: "20px 100px 30px 100px" }} content="Or"/>

                        <Step.Group ordered>
                            <Step>
                                <Step.Content>
                                    <Step.Title>Run Infomap</Step.Title>
                                    <Step.Description>Community detection using the Map Equation</Step.Description>
                                </Step.Content>
                            </Step>
                            <Step
                                as="label"
                                link
                                active
                                htmlFor="networkUpload"
                            >
                                <Step.Content>
                                    <Step.Title>Load network</Step.Title>
                                    <Step.Description>Supported format: <code>ftree</code></Step.Description>
                                </Step.Content>
                                <input
                                    style={{ display: "none" }}
                                    type='file'
                                    id='networkUpload'
                                    onChange={() => this.loadNetwork(this.input.files[0])}
                                    accept=".ftree"
                                    ref={input => this.input = input}
                                />
                            </Step>
                        </Step.Group>

                        {progressVisible &&
                        <div style={{ padding: "50px 100px 0" }}>
                            <Progress
                                align='left'
                                indicating
                                total={3}
                                error={progressError}
                                label={progressLabel}
                                value={progressValue}
                            />
                        </div>
                        }
                    </Segment>
                </div>
                <Documentation/>
            </React.Fragment>
        );
    }
}


export default FileDialog;
