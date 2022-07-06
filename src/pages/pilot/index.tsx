import { Button, Col, Divider, Form, Input, InputNumber, message, Modal, Row, Slider, Space, Table, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { history } from 'umi';
import { MinusCircleOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import { ScriptData } from '@/pages/script/index';
import DebounceSelect from "@/components/debounceSelect";
import { api } from "@/api/ApiConfig";
import Request, { async_request } from '@/utils/Request';
import type { AgentData } from '@/pages/interface.d';
import { AgentStatus } from "./interface.d";

interface ScriptValue {
    label: string,
    value: string,
}

const Pilot: React.FC = (props: any) => {

    const [form] = Form.useForm();
    const [scriptValue, setScripValue] = useState<ScriptValue>();
    const [selectedAgent, setSelectedAgent] = useState<AgentData[]>([]);
    const [agentList, setAgentList] = useState<AgentData[]>([]);
    const [loadData, setLoadData] = useState<number>(0);
    const [showModal, setShowModal] = useState<boolean>(false);

    const { pathname, query } = props.location;

    useEffect(() => {
        
        if(query && query.script) {
            Request({
                url: api.getScriptList.path,
                method: api.getScriptList.method,
                params: { id: query.script, }
            }, (res) => {
                if(res.data.data && res.data.data.length > 0){
                    let data = res.data.data[0];
                    form.setFieldsValue({
                        name: data.name,
                        script: { label: data.name, value: data.id },
                        duration: data.duration,
                    });
                }
            });
        }
    }, [loadData]);

    const handleScriptChange = (value: any) => {
        history.push({pathname: '/pilot', query: {script: value?.value}});
        form.setFieldsValue({
            name: value?.label,
        });
    }

    const handleFinish = () => {
        if(!selectedAgent || selectedAgent.length === 0) {
            message.error("None Agent Selected");
            return;
        }
        let name = form.getFieldValue("name");
        let script = form.getFieldValue("script")?.value;
        let duration = form.getFieldValue("duration") as number | undefined;
        let agents = form.getFieldValue("agents");
        let payload = {
            name,
            script,
            duration,
            agents,
        };
        Request({
            url: api.startPilot.path,
            method: api.startPilot.method,
            data: payload,
        }, (res) => {
            history.push({
                pathname: '/report', 
                query: {id: res.data?.data?.id},
            });
        });
    }

    const handleSubmit = () => {
        form.submit();
    }

    const handleReset = () => {
        history.push({pathname: '/pilot'});
        setSelectedAgent([]);
        form.resetFields();
    }

    const handShowModal = () => {
        getAgentData();
        setShowModal(true);
    }

    const handleCloseModal = () => {
        setShowModal(false);
    }

    const getAgentData = (payload?: any) => {
        Request({
            url: api.getAgentList.path,
            method: api.getAgentList.method,
            params: { ...payload }
        }, (res) => {
            setAgentList(res.data.data as AgentData[]);
        });
    }

    const handleChangeSelect = (selectedAgent: AgentData[]) => {
        // setSelectedAgent(selectedAgent);
    }

    const handleSelect = (
        record: AgentData, 
        selected: boolean, 
        add: (defauleValue: {id: string, name: string, threads: number}) => void, 
        remove: (id: number) => void) => 
    {
        if(selected) {
            setSelectedAgent(origin => {
                origin.push(record);
                return origin;
            })
            add({
                id: record.id,
                name: record.label,
                threads: 1,
            });
        } else {
            let agents = form.getFieldValue("agents");
            for(let i = 0; i < selectedAgent.length; i++){
                if(record.id === selectedAgent[i].id) {
                    setSelectedAgent(origin => {
                        origin.splice(i, 1);
                        return origin;
                    });
                }
            }
            if(agents && agents.length > 0){
                for(let i = 0; i < agents.length; i++) {
                    if(agents[i].id === record.id){
                        remove(i);
                    }
                }
            }
            
        }
    }

    return (
        <div>
            <Form form={form} name="pilot_form" autoComplete="off" onFinish={handleFinish}>
                <Row gutter={16}>
                    <Col>
                        <Space size={'large'}>
                            <Button type="primary" onClick={handleSubmit}>Start</Button>
                            <Button onClick={handleReset}>Reset</Button>
                        </Space>
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: "20px" }}>
                    <Col>
                        <Form.Item
                            name={'name'}
                            label='Pilot Name'
                            rules={[
                                { required: true, message: 'Missing Label' },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name={'script'}
                            label='Script'
                            // initialValue={{ label: pilotData?.scriptName, value: pilotData?.script }}
                            rules={[
                                { required: true, message: 'Missing Script' },
                            ]}
                        >
                            <DebounceSelect
                                placeholder="Select script"
                                onChange={(value, _) => handleScriptChange(value)}
                                showSearch
                                fetchOptions={(keyword) => async_request<ScriptValue[]>({
                                    url: api.getScriptList.path,
                                    method: api.getScriptList.method,
                                    params: { name: keyword },
                                }, (res) => res.data.data.map((item: ScriptData) => ({ label: item.name, value: item.id })))}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col>
                        <Form.Item
                            name={'duration'}
                            label='Duration(seconds)'
                            // initialValue={pilotData?.duration}
                            rules={[
                                { required: true, message: 'Need valid number' },
                                { min: 1, message: 'Cannot less than 1', type: "number" },
                            ]}
                        >
                            <InputNumber min={1} />
                        </Form.Item>
                    </Col>
                </Row>
                <Divider orientation='left' plain>Agent Setting</Divider>
                <Row>
                    <Form.List
                        name={'agents'}
                    >
                        {(fields, { add, remove }) => { 

                            return(
                            <>
                                {fields.map(({ key, name, ...restField }) => {

                                    return (

                                    <Space key={key} align="baseline" style={{ width: "100%" }}>
                                        <Form.Item
                                            {...restField}
                                            label="Agent ID"
                                            name={[name, "id"]}
                                        >
                                            <Input disabled bordered={false} />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            label="Agent Name"
                                            name={[name, "name"]}
                                        >
                                            <Input disabled bordered={false} />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            label={`Number of Threads(Max:${selectedAgent[name]?.volume})`}
                                            style={{ width: "400px" }}
                                        >
                                            <Row>

                                                <Col span={12}>
                                                    <Form.Item
                                                        name={[name, "threads"]}
                                                    >
                                                        <Slider min={1} max={selectedAgent[name]?.volume} />
                                                    </Form.Item>

                                                </Col>
                                                <Col>
                                                    <Form.Item
                                                        name={[name, "threads"]}
                                                    >
                                                        <InputNumber min={1} max={selectedAgent[name]?.volume} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => {
                                            remove(name);
                                            setSelectedAgent(origin => {
                                                origin.splice(name, 1);
                                                return origin;
                                            });
                                        }} />
                                    </Space>
                                )})}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => handShowModal()} block icon={<PlusOutlined />}>
                                        Add/Remove Agent
                                    </Button>
                                </Form.Item>
                                <AgentListModal
                                    title="Agent List"
                                    data={agentList}
                                    visible={showModal}
                                    onCancel={handleCloseModal}
                                    selectedAgent={selectedAgent}
                                    onChange={handleChangeSelect}
                                    onSelect={(record, selected) => handleSelect(record, selected, add, remove)}
                                />
                            </>
                        )}}
                    </Form.List>
                </Row>
            </Form>

        </div>
    );
}


interface AgentListModalProps {
    title: string,
    visible: boolean,
    data: AgentData[],
    selectedAgent?: AgentData[],
    onCancel?: () => void,
    onSelect?: (record: AgentData, selected: boolean) => void,
    onChange?: (selectedRows: AgentData[]) => void,
}

const AgentListModal: React.FC<AgentListModalProps> = (props: AgentListModalProps) => {

    const statusTag = (status: number) => {
        switch (status) {
            case AgentStatus.IDLE:
                return (
                    <Tag color='success'>Idel</Tag>
                );
            case AgentStatus.BUSY:
                return (
                    <Tag color='volcano' icon={<LoadingOutlined />}>Busy</Tag>
                );
            default:
                return (
                    <Tag color='default'>Unknown</Tag>
                );
        }
    }

    const columns: ColumnsType<AgentData> = [
        {
            key: 'label',
            title: "Agent Label",
            dataIndex: 'label',
        },
        {
            key: 'host',
            title: 'Host',
            dataIndex: 'host',
        },
        {
            key: 'port',
            title: 'Port',
            dataIndex: 'port',
        },
        {
            key: 'volume',
            title: 'Volume',
            dataIndex: 'volume',

        },
        {
            key: 'status',
            title: 'status',
            dataIndex: 'status',
            render: (value: any, record: AgentData, _index: number) => statusTag(record.status),
        },
    ];

    const rowIds = props?.selectedAgent?.map(item => item.id);

    return (
        <Modal title={props.title} visible={props.visible} onCancel={props.onCancel} width={800} footer={null}>
            <Table
                columns={columns}
                dataSource={props.data}
                rowKey={(row) => row.id}
                rowSelection={{
                    onSelect: (record, selected) => {
                        if(props.onSelect) {
                            props.onSelect(record, selected);
                        }
                    },
                    selectedRowKeys: rowIds,
                    onChange(_selectedRowKeys, selectedRows, _info) {
                        if (props.onChange) {
                            props.onChange(selectedRows);
                        }
                    },
                }}
            />
        </Modal>
    );
}

export default Pilot;