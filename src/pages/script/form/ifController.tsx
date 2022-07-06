import { Button, Col, Divider, Form, Input, InputNumber, Row, Switch } from "antd";
import { useState } from "react";
import { ScriptFormProps } from "../create";
import { generateComponentElement, generateParamElement, getParamElement, setParamValue } from "./common";

export function initIfControllerElement(key: string, label: string): Element {
    let node = generateComponentElement(key, label, "IfController", "Controller", "true");

    let node_expression = generateParamElement("expression", "string", "");
    node.appendChild(node_expression);

    return node;
}

const IfControllerForm: React.FC<ScriptFormProps> = (props: ScriptFormProps) => {
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

        let expression = form.getFieldValue("expression");
        setParamValue(xmlNode!, "expression", expression, "string");

        if (onChange) {
            onChange(xmlNode as Element);
        }
    }

    return (
        <Form form={form} name="if_controller_form" autoComplete="off" layout='horizontal' onFinish={handleFinish} >
            <Row>
                <Col><h3>IF Controller</h3></Col>
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
                    <Divider orientation='left' plain>IF Properties</Divider>
                    <Form.Item
                        name="expression"
                        label="Expression"
                        initialValue={getParamElement(xmlNode!, "expression")?.textContent }
                        rules={[
                            { required: true, message: 'Need a valid expression' },
                        ]}
                    >
                        <Input.TextArea disabled={!enabled}></Input.TextArea>
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

export default IfControllerForm;