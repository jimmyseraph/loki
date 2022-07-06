import { api } from "@/api/ApiConfig";
import React, { useState } from "react";
import Request from '@/utils/Request';
import { Link } from "umi";
import { Button, Col, DatePicker, Form, Input, message, Row, Space, Table } from "antd";
import type { ColumnsType } from 'antd/lib/table';
import moment from "moment";
import { history } from 'umi';

export interface ScriptData {
    id: string,
    name: string,
    creator: string,
    createTime: string,
    updateTime: string,
}

interface SearchParam {
    name?: string,
    creator?: string,
    createTimeStart?: string,
    createTimeEnd?: string,
}

const Script: React.FC = (props: any) => {

    const { query } = props.location;
    const [loading, setLoading] = useState<boolean>(false);
    const [scriptList, setScriptList] = useState<ScriptData[]>([]);
    const [searchParam, setSearchParam] = useState<SearchParam>({
        name: query?.name,
        creator: query?.creator,
        createTimeStart: query?.createTimeStart,
        createTimeEnd: query?.createTimeEnd,
    });

    const [form] = Form.useForm();

    const RangePicker:any = DatePicker.RangePicker;

    React.useEffect(() => {
        getData(searchParam);
    }, [searchParam]);

    const handleSearch = () => {
        let name: string = form.getFieldValue("name");
        let creator: string = form.getFieldValue("creator");
        let createTime:string[] = [];
        if(form.getFieldValue("createTime")) {
            createTime = [form.getFieldValue("createTime")[0].format("YYYY-MM-DD HH:mm:00"), form.getFieldValue("createTime")[1].format("YYYY-MM-DD HH:mm:00")];
        }
        let payload: SearchParam = {
            name,
            creator,
            createTimeStart: createTime.length === 2 ? createTime[0] : undefined,
            createTimeEnd: createTime.length === 2 ? createTime[1] : undefined,
        };
        history.push({pathname: '/script', query: {...payload}});
        setSearchParam(payload);
        
    }

    const getData = (payload?: any) => {
        setLoading(true);
        Request({
            url: api.getScriptList.path,
            method: api.getScriptList.method,
            params: {...payload}
        }, (res) => {
            setLoading(false);
            setScriptList(res.data.data);
        });
    }

    const handleSubmit = () => {
        form.submit();
    }

    const handleReset = () => {
        form.setFieldsValue({
            name: undefined,
            creator: undefined,
            createTime: undefined,
        });
    }

    const handleDelete = (id: string) => {
        Request({
            url: api.removeScript.path,
            method: api.removeScript.method,
            params:{
                id,
            }
        }, (_res) => {
            message.success(`Script id:${id} deleted successful`);
        });
    }

    const columns: ColumnsType<ScriptData> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (value: any, record: ScriptData, index: number) => <Link to={`/script/edit?id=${record.id}`}>{value}</Link>,
        },
        {
            title: 'Creator',
            dataIndex: 'creator',
            key: 'creator',
        },
        {
            title: 'Create Time',
            dataIndex: 'createTime',
            key: 'createTime',
            sorter: (a, b) => moment(a.createTime).valueOf() - moment(b.createTime).valueOf(),
        },
        {
            title: 'Update Time',
            dataIndex: 'updateTime',
            key: 'updateTime',
            sorter: (a, b) => moment(a.updateTime).valueOf() - moment(b.updateTime).valueOf(),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_value: any, record: ScriptData, index: number) => (
                <Space size='middle'>
                    <Button type='link' onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* {console.log(query)} */}
            <Form form={form} name="script_search_form" autoComplete="off" onFinish={handleSearch}>
                <Row gutter={16}>
                    <Col>
                        <Form.Item
                            name='name'
                            label='Script Name'
                            initialValue={query?.name}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col>
                        <Form.Item
                            name='creator'
                            label='Creator'
                            initialValue={query?.creator}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col>
                        <Form.Item
                            name='createTime'
                            label='Create Time'
                            initialValue={query && query.createTimeStart && query.createTimeEnd ? [moment(query?.createTimeStart), moment(query?.createTimeEnd)] : ""}
                        >
                            <RangePicker
                                ranges={{
                                    Today: [moment(moment().format("YYYY-MM-DD 00:00")), moment(moment().format("YYYY-MM-DD 23:59"))],
                                }}
                                showTime={{ format: 'HH:mm:00' }}
                                // format="YYYY-MM-DD HH:mm"
                            />
                        </Form.Item>
                    </Col>
                    <Col>
                        <Space size='middle'>
                            <Button type='primary' onClick={handleSubmit}>Search</Button>
                            <Button onClick={handleReset}>Reset</Button>
                        </Space>
                    </Col>
                </Row>
            </Form>
            <Row style={{marginTop: "20px"}}>
                <Button type="primary"><Link to={"/script/new"}>New Script</Link></Button>
            </Row>
            <Table columns={columns} dataSource={scriptList} rowKey={(row) => row.id} style={{marginTop: "10px"}} loading={loading}/>
        </div>
    )
}

export default Script;