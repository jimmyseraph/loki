import { Button, Checkbox, Col, Divider, Form, Input, InputNumber, Row, Select, Space, Switch } from "antd";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from "react";
import { ScriptFormProps } from "../create";
import { generateComponentElement, generateParamElement, getParamElement, getParamElements, setParamArray, setParamValue, setParamValueAsCDATA } from "./common";

export function initHTTPSamplerElement(key: string, label: string): Element {
    let node = generateComponentElement(key, label, "HTTPSampler", "Sampler", "true");

    let node_protocol = generateParamElement("protocol", "string", "HTTP");
    node.appendChild(node_protocol);

    let node_domain = generateParamElement("domain", "string", "");
    node.appendChild(node_domain);

    let node_port = generateParamElement("port", "int", "");
    node.appendChild(node_port);

    let node_method = generateParamElement("method", "string", "GET");
    node.appendChild(node_method);

    let node_path = generateParamElement("path", "string", "/");
    node.appendChild(node_path);

    let node_timeout = generateParamElement("timeout", "int", "60");
    node.appendChild(node_timeout);

    let node_follow_redirect = generateParamElement("follow-redirect", "bool", "true");
    node.appendChild(node_follow_redirect);

    let node_ignore_tls = generateParamElement("ignore-tls", "bool", "false");
    node.appendChild(node_ignore_tls);

    let node_enable_http2 = generateParamElement("enable-http2", "bool", "false");
    node.appendChild(node_enable_http2);

    let node_body = generateParamElement("body", "string", "");
    node.appendChild(node_body);

    return node;
}

const HTTPSamplerForm: React.FC<ScriptFormProps> = (props: ScriptFormProps) => {
    const [form] = Form.useForm();
    const [enabled, setEnabled] = useState<boolean>(props.xmlNode?.getAttribute("enabled") === "true")

    const { doc, xmlNode, onChange } = props;

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

        let protocol = form.getFieldValue("protocol");
        setParamValue(xmlNode!, "protocol", protocol);

        let domain = form.getFieldValue("domain");
        setParamValue(xmlNode!, "domain", domain);

        let port = form.getFieldValue("port");
        setParamValue(xmlNode!, "port", port);

        let method = form.getFieldValue("method");
        setParamValue(xmlNode!, "method", method);

        let path = form.getFieldValue("path");
        setParamValue(xmlNode!, "path", path);

        let follow_redirect = form.getFieldValue("follow-redirect");
        setParamValue(xmlNode!, "follow-redirect", follow_redirect);

        let ignore_tls = form.getFieldValue("ignore-tls");
        setParamValue(xmlNode!, "ignore-tls", ignore_tls);

        let enable_http2 = form.getFieldValue("enable-http2");
        setParamValue(xmlNode!, "enable-http2", enable_http2);

        let body = form.getFieldValue("body");
        setParamValueAsCDATA(doc, xmlNode!, "body", body);

        if(form.getFieldValue("headers") && form.getFieldValue("headers")[0]){
            let headerStrArr = (form.getFieldValue("headers") as {name: string, value: string}[]).map(item => item.name+"="+item.value);
            setParamArray(xmlNode!, "header", headerStrArr, "string");
        }

        

        if (onChange) {
            onChange(xmlNode as Element);
        }
    }

    return (
        <Form form={form} name="http_sampler_form" autoComplete="off" onFinish={handleFinish}>
            <Row>
                <Col><h3>HTTP Sampler</h3></Col>
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
                </Col>
            </Row>
            <Divider orientation='left' plain>Web Server</Divider>
            <Row gutter={8}>
                <Col span={4}>
                    <Form.Item
                        name="protocol"
                        label="Protocol"
                        initialValue={getParamElement(xmlNode!, "protocol") === null ? "HTTP" : getParamElement(xmlNode!, "protocol")?.innerHTML as string}
                    >
                        <Select disabled={!enabled}>
                            <Select.Option value="HTTP">HTTP</Select.Option>
                            <Select.Option value="HTTPS">HTTPS</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="domain"
                        label="Server Name or IP"
                        initialValue={getParamElement(xmlNode!, "domain") === null ? "" : getParamElement(xmlNode!, "domain")?.innerHTML as string}
                        rules={[
                            { required: true, message: 'Missing Server Name or IP' },
                        ]}
                    >
                        <Input disabled={!enabled} />
                    </Form.Item>
                </Col>
                <Col span={3}>
                    <Form.Item
                        name="port"
                        label="Port"
                        initialValue={getParamElement(xmlNode!, "port") === null ? 80 : parseInt(getParamElement(xmlNode!, "port")?.innerHTML as string)}
                    >
                        <InputNumber disabled={!enabled} />
                    </Form.Item>
                </Col>
            </Row>
            <Divider orientation='left' plain>HTTP Request</Divider>
            <Row gutter={8}>
                <Col span={3}>
                    <Form.Item
                        name="method"
                        initialValue={getParamElement(xmlNode!, "method") === null ? "GET" : getParamElement(xmlNode!, "method")?.innerHTML as string}
                    >
                        <Select disabled={!enabled}>
                            <Select.Option value="GET">GET</Select.Option>
                            <Select.Option value="POST">POST</Select.Option>
                            <Select.Option value="PUT">PUT</Select.Option>
                            <Select.Option value="HEAD">HEAD</Select.Option>
                            <Select.Option value="DELETE">DELETE</Select.Option>
                            <Select.Option value="PATCH">PATCH</Select.Option>
                            <Select.Option value="OPTION">OPTION</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="path"
                        label="Path"
                        initialValue={getParamElement(xmlNode!, "path") === null ? "" : getParamElement(xmlNode!, "path")?.innerHTML as string}
                    >
                        <Input disabled={!enabled} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={8}>
                <Col>
                    <Form.Item
                        name="follow-redirect"
                        valuePropName="checked"
                        initialValue={getParamElement(xmlNode!, "follow-redirect") === null ? true : getParamElement(xmlNode!, "follow-redirect")?.innerHTML as string === "true"}
                    >
                        <Checkbox disabled={!enabled}>Follow Redirects</Checkbox>
                    </Form.Item>
                </Col>
                <Col>
                    <Form.Item
                        name="ignore-tls"
                        valuePropName="checked"
                        initialValue={getParamElement(xmlNode!, "ignore-tls") === null ? false : getParamElement(xmlNode!, "ignore-tls")?.innerHTML as string === "true"}
                    >
                        <Checkbox disabled={!enabled}>Ignore TLS</Checkbox>
                    </Form.Item>
                </Col>
                <Col>
                    <Form.Item
                        name="enable-http2"
                        valuePropName="checked"
                        initialValue={getParamElement(xmlNode!, "enable-http2") === null ? false : getParamElement(xmlNode!, "enable-http2")?.innerHTML as string === "true"}
                    >
                        <Checkbox disabled={!enabled}>Enable HTTP2.0</Checkbox>
                    </Form.Item>
                </Col>
            </Row>
            <Divider orientation='left' plain>Headers</Divider>
            <Row gutter={8}>
                <Col span={14}>
                    <Form.List 
                        name="headers"
                        initialValue={
                            getParamElements(xmlNode!, "header") === null ? [] :
                                getParamElements(xmlNode!, "header").map(item => {
                                    let key_val = item.textContent?.split("=");
                                    return {name: key_val![0], value: key_val![1]};
                                })
                        }
                    >
                        {(fields, { add, remove }) => (
                            <>
                                {console.log(fields)}
                                {fields.map(({key, name, ...restField}) => (
                                    <Space key={key} align="baseline" style={{width: "100%"}}>
                                        <Form.Item
                                            key={key+"name"}
                                            {...restField}
                                            label="Header Name"
                                            name={[name, "name"]}

                                        >
                                            <Input disabled={!enabled} />
                                        </Form.Item>
                                        <Form.Item
                                            key={key+"value"}
                                            {...restField}
                                            label="Header Value"
                                            name={[name, "value"]}
                                        >
                                            <Input disabled={!enabled} style={{width: "300px"}} />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined /> } disabled={!enabled}>
                                        Add Header
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Col>
            </Row>
            <Divider orientation='left' plain>Body</Divider>
            <Row gutter={8}>
                <Col span={10}>
                    <Form.Item
                        name="body"
                        initialValue={getParamElement(xmlNode!, "body") === null ? "" : getParamElement(xmlNode!, "body")?.textContent}
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

export default HTTPSamplerForm;