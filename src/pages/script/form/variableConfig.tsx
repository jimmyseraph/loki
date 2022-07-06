import { Button, Checkbox, Col, Divider, Form, Input, InputNumber, Row, Select, Space, Switch } from "antd";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from "react";
import { ScriptFormProps } from "../create";
import { generateComponentElement, generateParamElement, getParamElement, getParamElements, setParamArray, setParamArrayWithElements, setParamValue } from "./common";

export function initVariableConfigElement(key: string, label: string): Element {
    let node = generateComponentElement(key, label, "Variable", "Config", "true");
    return node;
}

const VariableConfigForm: React.FC<ScriptFormProps> = (props: ScriptFormProps) => {
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

        if(form.getFieldValue("vars") && form.getFieldValue("vars")[0]){
            let children = (form.getFieldValue("vars") as {name: string, value: string}[]).map(item => generateParamElement(item.name, "string", item.value));
            setParamArrayWithElements(xmlNode!, children);
        }

        if (onChange) {
            onChange(xmlNode as Element);
        }
    }

    return (
        <Form form={form} name="http_sampler_form" autoComplete="off" onFinish={handleFinish}>
            <Row>
                <Col><h3>Varable Config</h3></Col>
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
                        <Input placeholder='Varable Config' disabled={!enabled} />
                    </Form.Item>
                </Col>
            </Row>
            <Divider orientation='left' plain>Custom Variable</Divider>
            <Row gutter={8}>
                <Col span={12}>
                    <Form.List 
                        name="vars"
                        initialValue={
                            (getParamElements(xmlNode!) === null ? [] : getParamElements(xmlNode!)).map(item => {
                                    return {name: item.getAttribute("name"), value: item.textContent};
                                })
                        }
                    >
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({key, name, ...restField}) => (
                                    <Space key={key} align="baseline" style={{width: "100%"}}>
                                        <Form.Item
                                            key={key+"name"}
                                            {...restField}
                                            label="Name"
                                            name={[name, "name"]}

                                        >
                                            <Input disabled={!enabled} />
                                        </Form.Item>
                                        <Form.Item
                                            key={key+"value"}
                                            {...restField}
                                            label="Value"
                                            name={[name, "value"]}
                                        >
                                            <Input disabled={!enabled} style={{width: "300px"}} />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined /> } disabled={!enabled}>
                                        Add Variable
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
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

export default VariableConfigForm;