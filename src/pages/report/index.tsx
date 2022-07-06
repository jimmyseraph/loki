import { Button, Col, DatePicker, Form, Input, Row, Select, Space, Table } from "antd";
import moment from "moment";
import React, { useState } from "react";
import { ReportStatus, statusTag } from "./interface.d";
import Request from '@/utils/Request';
import { history, Link } from 'umi';
import { api } from "@/api/ApiConfig";
import type { ColumnsType } from "antd/lib/table";

interface SearchParam {
    name?: string,
    creator?: string,
    status?: string,
    createTimeStart?: string,
    createTimeEnd?: string,
}

interface ReportData {
    id: string,
    name: string,
    status: number,
    creator: string,
    createTime: string,
    updateTime: string,
}

const Report: React.FC<ReportData> = (props: any) => {

    const { query } = props.location;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [reportList, setReportList] = useState<ReportData[]>([]);
    const [searchParam, setSearchParam] = useState<SearchParam>({
        name: query?.name,
        creator: query?.creator,
        status: query && query.status && query.status !== '' ? query.status : undefined,
        createTimeStart: query?.createTimeStart,
        createTimeEnd: query?.createTimeEnd,
    });

    const RangePicker:any = DatePicker.RangePicker;
    
    React.useEffect(() => {
        getData(searchParam);
    }, [searchParam]);

    const handleSearch = () => {
        let name: string = form.getFieldValue("name");
        let creator: string = form.getFieldValue("creator");
        let status: string = form.getFieldValue("status");
        let createTime:string[] = [];
        if(form.getFieldValue("createTime")) {
            createTime = [form.getFieldValue("createTime")[0].format("YYYY-MM-DD HH:mm:00"), form.getFieldValue("createTime")[1].format("YYYY-MM-DD HH:mm:00")];
        }
        let payload: SearchParam = {
            name,
            creator,
            status: status === "all" ? undefined : status,
            createTimeStart: createTime.length === 2 ? createTime[0] : undefined,
            createTimeEnd: createTime.length === 2 ? createTime[1] : undefined,
        };
        history.push({pathname: '/report', query: {...payload}});
        setSearchParam(payload);
        
    }

    const getData = (payload?: any) => {
        setLoading(true);
        Request({
            url: api.getReportList.path,
            method: api.getReportList.method,
            params: {...payload}
        }, (res) => {
            setLoading(false);
            setReportList(res.data.data);
        });
    }

    const handleSubmit = () => {
        form.submit();
    }

    const handleReset = () => {
        form.setFieldsValue({
            name: undefined,
            status: 'all',
            creator: undefined,
            createTime: undefined,
        });
    }

    const handleDelete = (id: string) => {
        // Request({
        //     url: api.removePilot.path,
        //     method: api.removePilot.method,
        //     params:{
        //         id,
        //     }
        // }, (_res) => {
        //     message.success(`Pilot id:${id} deleted successful`);
        // });
    }

    const columns: ColumnsType<ReportData> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (value: any, record: ReportData, _index: number) => <Link to={`/report/detail?id=${record.id}`}>{value}</Link>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (value: any, record: ReportData, _index: number) => statusTag(record.status),
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
            render: (_value: any, record: ReportData, _index: number) => (
                <Space size='middle'>
                    <Button type='link' onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Form form={form} name="report_search_form" autoComplete="off" onFinish={handleSearch}>
            <Row gutter={16}>
                    <Col span={4}>
                        <Form.Item
                            name='name'
                            label='Report Name'
                            initialValue={query?.name}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name='creator'
                            label='Creator'
                            initialValue={query?.creator}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item
                            name='status'
                            label='Status'
                            initialValue={query && query.status && query.status !== '' ? query.status : 'all'}
                        >
                            <Select>
                                <Select.Option value="all">All</Select.Option>
                                <Select.Option value={ReportStatus.FINISHED}>Finished</Select.Option>
                                <Select.Option value={ReportStatus.RUNNING}>Running</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
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
            
            <Table columns={columns} dataSource={reportList} rowKey={(row) => row.id} style={{marginTop: "10px"}} loading={loading}/>
        </div>
    )
}

export default Report;