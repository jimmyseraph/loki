import { Button, Col, Divider, Form, Input, InputNumber, Row, Switch } from "antd";
import { useState } from "react";
import { ScriptFormProps } from "../create";
import { generateComponentElement, generateParamElement, getParamElement, setParamValue } from "./common";

export function initLoopControllerElement(key: string, label: string): Element {
    let node = generateComponentElement(key, label, "LoopController", "Controller", "true");

    let node_loop_count = generateParamElement("loop_count", "string", "1");
    node.appendChild(node_loop_count);

    return node;
}

const LoopControllerForm: React.FC<ScriptFormProps> = (props: ScriptFormProps) => {
    const [form] = Form.useForm();
    const [enabled, setEnabled] = useState<boolean>(props.xmlNode?.getAttribute("enabled") === "true")

    const { xmlNode, onChange } = props;

    const handleEnabled = (checked: boolean, event: MouseEvent) => {
        setEnabled(checked);
    }

    const handleApply = () => {
        form.submit();
    }

    const handleFinish = () => {
        let label = form.getFieldValue("label");
        let enabled = form.getFieldValue("enabled");
        xmlNode?.setAttribute("label", label);
        xmlNode?.setAttribute("enabled", enabled.toString());

        let loop_count = form.getFieldValue("loop_count");
        setParamValue(xmlNode!, "loop_count", loop_count, "string");

        if (onChange) {
            onChange(xmlNode as Element);
        }
    }

    return (
        <Form form={form} name="loop_controller_form" autoComplete="off" layout='horizontal' onFinish={handleFinish} >
            <Row>
                <Col><h3>Loop Controller</h3></Col>
            </Row>
            <Row gutter={24} style={{ marginTop: "1.5em" }}>
                <Col span={10}>
                    <Form.Item
                        name="enabled"
                        valuePropName="checked"
                        initialValue={enabled}
                    >
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" onChange={handleEnabled} />
                    </Form.Item>
                    <Form.Item
                        name="label"
                        label="Label"
                        initialValue={xmlNode?.getAttribute("label")}
                        rules={[
                            { required: true, message: 'Missing Label' },
                            { max: 20, message: 'Length larger then 20', type: 'string' }
                        ]}
                    >
                        <Input placeholder='If Controller' disabled={!enabled} />
                    </Form.Item>
                    <Divider orientation='left' plain>Loop Properties</Divider>
                    <Form.Item
                        name="loop_count"
                        label="Loop Count"
                        initialValue={getParamElement(xmlNode!, "loop_count")?.innerHTML as string}
                        rules={[
                            { required: true, message: 'Cannot be blank' },
                        ]}
                    >
                        <Input disabled={!enabled}/>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={24} style={{ marginTop: "1.5em" }}>
                <Col>
                    <Button type='primary' onClick={handleApply}>Apply</Button>
                </Col>
            </Row>
        </Form>
    );
}

export default LoopControllerForm;