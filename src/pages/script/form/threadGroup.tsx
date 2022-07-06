import { Button, Checkbox, Col, Divider, Form, Input, InputNumber, Row, Switch } from 'antd';
import React, { useState } from 'react';
import { ScriptFormProps } from '../create';
import { generateComponentElement, generateParamElement, getParamElement, setParamValue } from './common';

export function initThreadGroupElement(key: string, label: string): Element {
    let node = generateComponentElement(key, label, "ThreadGroup", "Thread", "true");

    let node_num_threads = generateParamElement("num_threads", "int", "1");
    node.appendChild(node_num_threads);

    let node_ramp_time = generateParamElement("ramp_time", "int", "1");
    node.appendChild(node_ramp_time);

    let node_duration = generateParamElement("duration", "int", "1");
    node.appendChild(node_duration);

    let node_num_loop = generateParamElement("num_loop", "int", "1");
    node.appendChild(node_num_loop);

    let node_scheduler = generateParamElement("scheduler", "bool", "false");
    node.appendChild(node_scheduler);

    return node;
}

const ThreadGroupForm: React.FC<ScriptFormProps> = (props: ScriptFormProps) => {
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

        let num_threads = form.getFieldValue("num_threads");
        setParamValue(xmlNode!, "num_threads", num_threads);

        let ramp_time = form.getFieldValue("ramp_time");
        setParamValue(xmlNode!, "ramp_time", ramp_time);

        let num_loop = form.getFieldValue("num_loop");
        setParamValue(xmlNode!, "num_loop", num_loop);

        let scheduler = form.getFieldValue("scheduler");
        setParamValue(xmlNode!, "scheduler", scheduler);

        let duration = form.getFieldValue("duration");
        setParamValue(xmlNode!, "duration", duration);
        
        if (onChange) {
            onChange(xmlNode as Element);
        }
    }

    return (
        <Form form={form} name="thread_group_form" autoComplete="off" layout='horizontal' onFinish={handleFinish} >
            <Row>
                <Col><h3>Thread Group</h3></Col>
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
                            { max: 20, message: 'Length larger then 20', type:'string' }
                        ]}
                    >
                        <Input placeholder='thread group' disabled={!enabled}/>
                    </Form.Item>
                    <Divider orientation='left' plain>Thread Properties</Divider>
                    <Form.Item
                        name="num_threads"
                        label="Number of Threads(users)"
                        initialValue={parseInt(getParamElement(xmlNode!, "num_threads")?.innerHTML as string)}
                        rules={[
                            { required: true, message: 'Need valid number' },
                            { min: 1, message: 'Cannot less than 1', type: "number" },
                        ]}
                    >
                        <InputNumber disabled={!enabled}/>
                    </Form.Item>
                    <Form.Item
                        name="ramp_time"
                        label="Ramp-up period(seconds)"
                        initialValue={parseInt(getParamElement(xmlNode!, "ramp_time")?.innerHTML as string)}
                        rules={[
                            { required: true, message: 'Need valid number' },
                            { min: 0, message: 'Cannot less than 0', type: "number" },
                        ]}
                    >
                        <InputNumber disabled={!enabled}/>
                    </Form.Item>
                    <Form.Item
                        name="num_loop"
                        label="Loop Count"
                        initialValue={parseInt(getParamElement(xmlNode!, "num_loop")?.innerHTML as string)}
                        rules={[
                            { required: true, message: 'Need valid number' },
                            { min: 1, message: 'Cannot less than 1', type: "number" },
                        ]}
                    >
                        <InputNumber disabled={!enabled}/>
                    </Form.Item>
                    <Form.Item
                        name="scheduler"
                        label="Scheduler"
                        initialValue={(getParamElement(xmlNode!, "scheduler")?.innerHTML as string) === "true"}
                        valuePropName="checked"
                    >
                        <Checkbox disabled={!enabled}/>
                    </Form.Item>
                    <Form.Item
                        name="duration"
                        label="Duration"
                        initialValue={parseInt(getParamElement(xmlNode!, "duration")?.innerHTML as string)}
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

export default ThreadGroupForm;