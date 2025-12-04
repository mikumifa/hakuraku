import React from "react";
import { Button, Col, Form } from "react-bootstrap";
import RaceDataPresenter from "../components/RaceDataPresenter";
import { RaceSimulateData } from "../data/race_data_pb";
import { deserializeFromBase64 } from "../data/RaceDataParser";

type RaceDataPageState = {
    raceHorseInfoInput: string,
    raceScenarioInput: string,

    parsedHorseInfo: any,
    parsedRaceData: RaceSimulateData | undefined,
};

export default class RaceDataPage extends React.Component<{}, RaceDataPageState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            raceHorseInfoInput: '',
            raceScenarioInput: '',

            parsedHorseInfo: undefined,
            parsedRaceData: undefined,
        };
    }

    parse() {
        this.setState({ parsedRaceData: deserializeFromBase64(this.state.raceScenarioInput.trim()) });
        try {
            this.setState({ parsedHorseInfo: JSON.parse(this.state.raceHorseInfoInput) });
        } catch (e) {
            this.setState({ parsedHorseInfo: undefined });
        }
    }
    handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            const lines = text.split(/\r?\n/);

            const scenario = lines.length > 0 ? lines[0].trim() : '';

            const horseInfo = lines.length > 1 ? lines[1].trim() : '';

            this.setState({
                raceScenarioInput: scenario,
                raceHorseInfoInput: horseInfo,
                parsedRaceData: undefined,
                parsedHorseInfo: undefined
            });
        };
        reader.readAsText(file);
    }
    render() {
        return <>
            <Form>
                {/* 新增：文件上传区域 */}
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Label>Load from Config File (Optional)</Form.Label>
                        <div className="custom-file">
                            <Form.Control
                                type="file"
                                accept=".txt,.json,.csv" // 限制文件类型，可按需修改
                                onChange={this.handleFileUpload}
                            />
                            <Form.Text className="text-muted">
                                Format: Line 1 = <code>race_scenario</code>, Line 2 = <code>race_horse_data</code>
                            </Form.Text>
                        </div>
                    </Form.Group>
                </Form.Row>

                <hr />

                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Label>
                            [Optional] <code>race_start_info.race_horse_data</code> (for single
                            mode), <code>race_horse_data_array</code> (for daily race / legend race, not in the same
                            packet), or <code>race_start_params_array.race_horse_data_array</code> (for team race)
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            // 绑定 value 到 state，以便文件上传后能显示内容
                            value={this.state.raceHorseInfoInput}
                            onChange={e => this.setState({ raceHorseInfoInput: e.target.value })} />
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Label>[Required] <code>race_scenario</code></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            // 绑定 value 到 state
                            value={this.state.raceScenarioInput}
                            onChange={e => this.setState({ raceScenarioInput: e.target.value })} />
                    </Form.Group>
                </Form.Row>
                <Button variant="primary" onClick={() => this.parse()}>
                    Parse
                </Button>
            </Form>

            <hr />

            {this.state.parsedRaceData &&
                <RaceDataPresenter
                    raceHorseInfo={this.state.parsedHorseInfo}
                    raceData={this.state.parsedRaceData} />}
        </>;
    }

}

