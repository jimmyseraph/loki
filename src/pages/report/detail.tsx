import { api } from "@/api/ApiConfig";
import Request from "@/utils/Request";
import { Card, Col, Collapse, Descriptions, message, Row, Space, Spin, Table } from "antd";
import React, { ReactNode, useEffect, useState } from "react";
import { history } from 'umi';
import type { ColumnsType } from "antd/lib/table";
import { LineChartOutlined } from '@ant-design/icons';
import { ReportStatus, statusTag } from "./interface.d";
import { Line } from '@ant-design/charts';

interface ReportInfoData {
    id: string,
    name: string,
    script: string,
    scriptName: string,
    duration: number,
    status: number,
    threads: number,
    startTime: string,
    endTime: string,
}

interface SamplerData {
    id: string,
    label: string,
    samplers: number,
    failures: number,
    errorPercent: number,
    average: number,
    min: number,
    max: number,
    ninty: number,
    ninty_five: number,
    ninty_nine: number,
    tps: number,
    recieved: number,
    sent: number,
}

interface SamplerErrorData {
    id: string,
    type: string,
    num: number,
    errorPercent: number,
    threadsPercent: number,
}

const ReportDetail: React.FC = (props: any) => {

    const { query } = props.location;
    const [reportInfo, setReportInfo] = useState<ReportInfoData>();
    const [samplersData, setSamplersData] = useState<SamplerData[]>([]);
    const [errorData, setErrorData] = useState<SamplerErrorData[]>([]);
    const [responseTimesOverTimeData, setResponseTimesOverTimeData] = useState([]);
    const [activeThreadsOverTimeData, setActiveThreadsOverTimeData] = useState([]);
    const [bytesThroughputOverTimeData, setBytesThroughputOverTimeData] = useState([]);
    const [transactionsPerSecondData, setTransactionsPerSecondData] = useState([]);

    let timeHandler: number | undefined = undefined;

    useEffect(() => {
        Request({
            url: api.getReportInfo.path,
            method: api.getReportInfo.method,
            params: query,
        }, (res) => {
            if (!res.data.data) {
                message.error("No such report");
                history.push("/report");
            } else {
                setReportInfo(res.data.data);
                if (res.data.data.status === ReportStatus.RUNNING) {
                    timeHandler = setInterval((payload: { id: string }): void => {
                        getReportInfo(payload);
                        getStatistics(payload);
                    }, 5000, { id: query?.id });
                } else if (timeHandler) {
                    clearInterval(timeHandler);
                } else {
                    getReportInfo({ id: query?.id });
                    getStatistics({ id: query?.id });
                }
            }
        });

        return () => {
            if (timeHandler) {
                clearInterval(timeHandler);
            }
        }
    }, []);


    useEffect(() => {
        console.log(reportInfo);
        if (reportInfo?.status === ReportStatus.FINISHED) {
            if(timeHandler){
                clearInterval(timeHandler);
            }
            Request({
                url: api.getReportCharts.path,
                method: api.getReportCharts.method,
            }, (res) => {
                if(res.data.data && res.data.data.response_times_over_time && res.data.data.response_times_over_time.length > 0) {
                    setResponseTimesOverTimeData(res.data.data.response_times_over_time);
                    setActiveThreadsOverTimeData(res.data.data.active_threads_over_time);
                    setBytesThroughputOverTimeData(res.data.data.bytes_throughput_over_time);
                    setTransactionsPerSecondData(res.data.data.transactions_per_second);
                }
            });
        }
    }, [reportInfo]);

    const getReportInfo = (payload: any) => {
        Request({
            url: api.getReportInfo.path,
            method: api.getReportInfo.method,
            params: payload,
        }, (res) => {
            if (res.data.data) {
                setReportInfo(res.data.data);
            }
        });
    }

    const getStatistics = (payload: any) => {
        Request({
            url: api.getReportStatistics.path,
            method: api.getReportStatistics.method,
            params: payload,
        }, (res) => {
            let sdList: SamplerData[] = [];
            let edList: SamplerErrorData[] = [];
            if (res.data.data && res.data.data.length > 0) {
                res.data.data.forEach((item: any, index: number) => {
                    sdList.push({
                        id: index + "",
                        label: item.label,
                        samplers: item.samplers,
                        failures: item.failures,
                        errorPercent: (item.failures as number) / (item.samplers as number),
                        average: item.average,
                        min: item.min,
                        max: item.max,
                        ninty: item.ninty,
                        ninty_five: item.ninty_five,
                        ninty_nine: item.ninty_nine,
                        tps: item.tps,
                        recieved: item.recieved,
                        sent: item.sent,
                    });
                    if (item.errors && item.errors.length > 0) {
                        item.errors.forEach((err: any) => {
                            for (let i = 0; i < edList.length; i++) {
                                if (edList[i].type === err.type) {
                                    edList[i].num += err.num;
                                    return;
                                }
                            }
                            edList.push({
                                id: "",
                                type: err.type,
                                num: err.num,
                                errorPercent: 0.0,
                                threadsPercent: 0.0,
                            });
                        });
                    }
                });
                let all_samplers = 0;
                let all_errors = 0;
                sdList.forEach(item => all_samplers += item.samplers);
                edList.forEach(item => all_errors += item.num);
                edList.forEach((item, index) => {
                    item.id = index + "";
                    item.errorPercent = item.num / all_errors;
                    item.threadsPercent = item.num / all_samplers;
                });
                setSamplersData(sdList);
                setErrorData(edList);
            }
        });
    }

    const samplerInfoColumns: ColumnsType<SamplerData> = [
        {
            title: "Label",
            key: "label",
            dataIndex: 'label',
        },
        {
            title: '#Samplers',
            key: 'samplers',
            dataIndex: 'samplers',
        },
        {
            title: 'Failures',
            key: 'failures',
            dataIndex: 'failures',
        },
        {
            title: 'Error%',
            key: 'errorPercent',
            dataIndex: 'errorPercent',
            render: (value: any, _record: SamplerData, _index: number): ReactNode => (
                (value as number * 100).toFixed(2) + '%'
            ),
        },
        {
            title: 'Average',
            key: 'average',
            dataIndex: 'average',
            render: (value: any, _record: SamplerData, _index: number): ReactNode => (
                (value as number).toFixed(2)
            ),
        },
        {
            title: 'Min',
            key: 'min',
            dataIndex: 'min',
        },
        {
            title: 'Max',
            key: 'max',
            dataIndex: 'max',
        },
        {
            title: '90th pct',
            key: 'ninty',
            dataIndex: 'ninty',
            render: (value: any, _record: SamplerData, _index: number): ReactNode => (
                (value as number).toFixed(2)
            ),
        },
        {
            title: '95th pct',
            key: 'ninty_five',
            dataIndex: 'ninty_five',
            render: (value: any, _record: SamplerData, _index: number): ReactNode => (
                (value as number).toFixed(2)
            ),
        },
        {
            title: '99th pct',
            key: 'ninty_nine',
            dataIndex: 'ninty_nine',
            render: (value: any, _record: SamplerData, _index: number): ReactNode => (
                (value as number).toFixed(2)
            ),
        },
        {
            title: 'Transactions/s',
            key: 'tps',
            dataIndex: 'tps',
            render: (value: any, _record: SamplerData, _index: number): ReactNode => (
                (value as number).toFixed(2)
            ),
        },
        {
            title: 'Recieved',
            key: 'recieved',
            dataIndex: 'recieved',
            render: (value: any, _record: SamplerData, _index: number): ReactNode => (
                (value as number).toFixed(2)
            ),
        },
        {
            title: 'Sent',
            key: 'sent',
            dataIndex: 'sent',
            render: (value: any, _record: SamplerData, _index: number): ReactNode => (
                (value as number).toFixed(2)
            ),
        },
    ];

    const errorInfoColumns: ColumnsType<SamplerErrorData> = [
        {
            title: "Type of Error",
            key: "type",
            dataIndex: 'type',
        },
        {
            title: "Number of errors",
            key: "num",
            dataIndex: 'num',
        },
        {
            title: "% in errors",
            key: "errorPercent",
            dataIndex: 'errorPercent',
            render: (value: any, _record: SamplerErrorData, _index: number): ReactNode => (
                (value as number * 100).toFixed(2) + '%'
            ),
        },
        {
            title: "% in all threads",
            key: "threadsPercent",
            dataIndex: 'threadsPercent',
            render: (value: any, _record: SamplerErrorData, _index: number): ReactNode => (
                (value as number * 100).toFixed(2) + '%'
            ),
        },
    ];

    const panelHeaderRender = (header: string) => {
        return (
            <Space>
                <LineChartOutlined />
                {header}
            </Space>
        );
    }

    return (
        <div>
            <Row>
                <Col offset={8}>
                    <h2>{reportInfo?.name}</h2>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={24}>
                    <Card style={{ width: '100%' }}>
                        <Descriptions title="基本信息" bordered style={{ width: '100%' }} column={2}>
                            <Descriptions.Item label='测试开始时间'>{reportInfo?.startTime}</Descriptions.Item>
                            <Descriptions.Item label='测试结束时间'>{reportInfo?.endTime}</Descriptions.Item>
                            <Descriptions.Item label='测试总耗时'>{reportInfo?.duration}</Descriptions.Item>
                            <Descriptions.Item label='运行脚本'>{reportInfo?.scriptName}</Descriptions.Item>
                            <Descriptions.Item label='线程数'>{reportInfo?.threads}</Descriptions.Item>
                            <Descriptions.Item label='状态'>{statusTag(reportInfo?.status)}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
            <Row style={{ marginTop: "20px" }}>
                <h3>Statistics of Samplers</h3>
                <Table columns={samplerInfoColumns} dataSource={samplersData} rowKey={(row) => row.id} pagination={false} bordered style={{ width: "100%" }} />
            </Row>
            <Row style={{ marginTop: "20px" }}>
                <h3>Statistics of Errors</h3>
                <Table columns={errorInfoColumns} dataSource={errorData} rowKey={(row) => row.id} pagination={false} bordered style={{ width: "100%" }} />
            </Row>
            <Row style={{ marginTop: "20px" }}>
                <Space direction="vertical" size={'large'} style={{ width: "100%" }}>
                    <Spin tip="Collecting..." spinning={!reportInfo || reportInfo.status !== ReportStatus.FINISHED}>
                        <Collapse collapsible={"header"} >
                            <Collapse.Panel header={panelHeaderRender('Response Times Over Time')} key={1}>
                                <Line 
                                    data={responseTimesOverTimeData} 
                                    xField='time' 
                                    yField='response_times' 
                                    seriesField='label'
                                    xAxis={{
                                        tickCount: 15,
                                    }} 
                                />
                            </Collapse.Panel>
                        </Collapse>
                    </Spin>
                    <Spin tip="Collecting..." spinning={!reportInfo || reportInfo.status !== ReportStatus.FINISHED}>
                        <Collapse collapsible={"header"} >
                            <Collapse.Panel header={panelHeaderRender('Active Threads Over Time')} key={1}>
                                <Line 
                                    data={activeThreadsOverTimeData} 
                                    xField='time' 
                                    yField='active_threads' 
                                    xAxis={{
                                        tickCount: 15,
                                    }} 
                                />
                            </Collapse.Panel>
                        </Collapse>
                    </Spin>
                    <Spin tip="Collecting..." spinning={!reportInfo || reportInfo.status !== ReportStatus.FINISHED}>
                        <Collapse collapsible={"header"} >
                            <Collapse.Panel header={panelHeaderRender('Bytes Throughput Over Time')} key={1}>
                                <Line 
                                    data={bytesThroughputOverTimeData} 
                                    xField='time' 
                                    yField='bytes' 
                                    xAxis={{
                                        tickCount: 15,
                                    }} 
                                />
                            </Collapse.Panel>
                        </Collapse>
                    </Spin>
                    <Spin tip="Collecting..." spinning={!reportInfo || reportInfo.status !== ReportStatus.FINISHED}>
                        <Collapse collapsible={"header"} >
                            <Collapse.Panel header={panelHeaderRender('Transactions Per Second')} key={1}>
                                <Line 
                                    data={transactionsPerSecondData} 
                                    xField='time' 
                                    yField='transactions' 
                                    seriesField='label'
                                    yAxis={{
                                        title: {
                                            text: "Number of transactions / sec"
                                        }
                                    }}
                                    xAxis={{
                                        tickCount: 15,
                                    }} 
                                />
                            </Collapse.Panel>
                        </Collapse>
                    </Spin>
                </Space>
            </Row>
        </div>
    );
}

export default ReportDetail;