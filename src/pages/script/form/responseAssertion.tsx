import { Button, Col, Divider, Form, Input, InputNumber, Radio, Row, Select, Switch } from "antd";
import React, { useState } from "react";
import { ScriptFormProps } from "../create";
import { generateComponentElement, generateParamElement, getParamElement, setParamValue, setParamValueAsCDATA } from "./common";

export function initResponseAssertionElement(key: string, label: string): Element {
    let node = generateComponentElement(key, label, "ResponseAssertion", "Assertion", "true");

    let node_field = generateParamElement("field", "string", "body");
    node.appendChild(node_field);

    let node_rule = generateParamElement("rule", "string", "");
    node.appendChild(node_rule);

    let node_pattern = generateParamElement("pattern", "string", "");
    node.appendChild(node_pattern);
    
    return node;
}

const ResponseAssertionForm: React.FC<ScriptFormProps> = (props: ScriptFormProps) => {

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

        let field = form.getFieldValue("field");
        setParamValue(xmlNode!, "field", field);

        let pattern = form.getFieldValue("pattern");
        setParamValueAsCDATA(doc, xmlNode!, "pattern", pattern);

        let rule = form.getFieldValue("rule");
        setParamValue(xmlNode!, "rule", rule);

        if (onChange) {
            onChange(xmlNode as Element);
        }
    }

    return (
        <Form form={form} name="response_assertion_form" autoComplete="off" onFinish={handleFinish}>
            <Row>
                <Col><h3>Response Assertion</h3></Col>
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
                        <Input placeholder='response assertion' disabled={!enabled} />
                    </Form.Item>
                </Col>
            </Row>
            <Divider orientation='left' plain>Field to Test</Divider>
            <Row gutter={8}>
                <Col span={20}>
                    <Form.Item
                        name="field"
                        initialValue={getParamElement(xmlNode!, "field") === null ? "body" : getParamElement(xmlNode!, "field")?.textContent as string}
                    >
                        <Radio.Group disabled={!enabled} >
                            <Radio value={'body'}>Response Body</Radio>
                            <Radio value={'code'}>Response Code</Radio>
                            <Radio value={'message'}>Response Message</Radio>
                            <Radio value={'headers'}>Response Headers</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Col>
            </Row>
            <Divider orientation='left' plain>Pattern Match Rule</Divider>
            <Row gutter={8}>
                <Col span={10}>
                    <Form.Item
                        name="rule"
                        label='Match Rule'
                        initialValue={getParamElement(xmlNode!, "rule") === null ? "" : getParamElement(xmlNode!, "rule")?.textContent as string}
                    >
                        <Select disabled={!enabled} >
                            <Select.Option value={'contains'}>Contains</Select.Option>
                            <Select.Option value={'matches'}>Matches</Select.Option>
                            <Select.Option value={'equals'}>Equals</Select.Option>
                            <Select.Option value={'not-contains'}>Not Contains</Select.Option>
                            <Select.Option value={'not-matches'}>Not Matches</Select.Option>
                            <Select.Option value={'not-equals'}>Not Equals</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Divider orientation='left' plain>Pattern to Test</Divider>
            <Row gutter={8}>
                <Col span={10}>
                    <Form.Item
                        name="pattern"
                        initialValue={getParamElement(xmlNode!, "pattern") === null ? "" : getParamElement(xmlNode!, "pattern")?.textContent}
                    >
                        <Input.TextArea rows={10} disabled={!enabled} />
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

export default ResponseAssertionForm;
