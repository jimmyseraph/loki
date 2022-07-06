import { Button, Col, Divider, Form, Input, InputNumber, Row, Switch } from "antd";
import { useState } from "react";
import { ScriptFormProps } from "../create";
import { generateComponentElement, generateParamElement, getParamElement, setParamValue } from "./common";

export function initHelloSamplerElement(key: string, label: string): Element {
    let node = generateComponentElement(key, label, "HelloSampler", "Sampler", "true");

    let node_name = generateParamElement("name", "string", "gmeter");
    node.appendChild(node_name);

    let node_sleep = generateParamElement("sleep", "int", "500");
    node.appendChild(node_sleep);

    return node;
}

const HelloSamplerForm: React.FC<ScriptFormProps> = (props: ScriptFormProps) => {
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

        let name = form.getFieldValue("name");
        setParamValue(xmlNode!, "name", name);

        let sleep = form.getFieldValue("sleep");
        setParamValue(xmlNode!, "sleep", sleep);

        if (onChange) {
            onChange(xmlNode as Element);
        }
    }

    return (
        <Form form={form} name="hello_sampler_form" autoComplete="off" layout='horizontal' onFinish={handleFinish} >
            <Row>
                <Col><h3>Hello Sampler</h3></Col>
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
                        <Input placeholder='hello sampler' disabled={!enabled} />
                    </Form.Item>
                    <Divider orientation='left' plain>Hello Sampler Properties</Divider>
                    <Form.Item
                        name="name"
                        label="Name"
                        initialValue={getParamElement(xmlNode!, "name")?.innerHTML as string}
                        rules={[
                            { required: true, message: 'Cannot be null' },
                        ]}
                    >
                        <Input disabled={!enabled}/>
                    </Form.Item>
                    <Form.Item
                        name="sleep"
                        label="Sleep(milliseconds)"
                        initialValue={parseInt(getParamElement(xmlNode!, "sleep")?.innerHTML as string)}
                        rules={[
                            { required: true, message: 'Need valid number' },
                            { min: 0, message: 'Cannot less than 0', type: "number" },
                        ]}
                    >
                        <InputNumber disabled={!enabled}/>
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

export default HelloSamplerForm;