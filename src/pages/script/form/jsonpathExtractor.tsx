import { Button, Col, Divider, Form, Input, InputNumber, Row, Switch } from "antd";
import React, { useState } from "react";
import { ScriptFormProps } from "../create";
import { generateComponentElement, generateParamElement, getParamElement, setParamValue, setParamValueAsCDATA } from "./common";

export function initJSONPathExtractorElement(key: string, label: string): Element {
    let node = generateComponentElement(key, label, "JSONPathExtractor", "PostProcessor", "true");

    let node_name = generateParamElement("name", "string", "");
    node.appendChild(node_name);

    let node_exp = generateParamElement("exp", "string", "");
    node.appendChild(node_exp);

    let node_match_no = generateParamElement("match_no", "int", "");
    node.appendChild(node_match_no);
    
    return node;
}

const JSONPathExtractorForm: React.FC<ScriptFormProps> = (props: ScriptFormProps) => {

    const [form] = Form.useForm();
    const [enabled, setEnabled] = useState<boolean>(props.xmlNode?.getAttribute("enabled") === "true")

    const { doc, xmlNode, onChange } = props;

    const handleEnabled = (checked: boolean, _event: MouseEvent) => {
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

        let exp = form.getFieldValue("exp");
        setParamValueAsCDATA(doc, xmlNode!, "exp", exp);

        let match_no = form.getFieldValue("match_no");
        setParamValue(xmlNode!, "match_no", match_no);

        if (onChange) {
            onChange(xmlNode as Element);
        }
    }

    return (
        <Form form={form} name="json_path_extractor_form" autoComplete="off" onFinish={handleFinish}>
            <Row>
                <Col><h3>JSON Path Extractor</h3></Col>
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
                        <Input placeholder='json-path extractor' disabled={!enabled} />
                    </Form.Item>
                </Col>
            </Row>
            <Divider orientation='left' plain>Properties</Divider>
            <Row gutter={8}>
                <Col span={15}>
                    <Form.Item
                        name="name"
                        label="Name of Created Variable"
                        initialValue={getParamElement(xmlNode!, "name") === null ? "" : getParamElement(xmlNode!, "name")?.textContent as string}
                    >
                        <Input disabled={!enabled} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={8}>
                <Col span={15}>
                    <Form.Item
                        name="exp"
                        label="JSON Path Expression"
                        initialValue={getParamElement(xmlNode!, "exp") === null ? "" : getParamElement(xmlNode!, "exp")?.textContent as string}
                    >
                        <Input disabled={!enabled} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={8}>
                <Col span={15}>
                    <Form.Item
                        name="match_no"
                        label="Match No(0 for random)"
                        initialValue={getParamElement(xmlNode!, "match_no") === null ? 1 : parseInt(getParamElement(xmlNode!, "match_no")?.textContent as string)}
                    >
                        <InputNumber disabled={!enabled} />
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

export default JSONPathExtractorForm;