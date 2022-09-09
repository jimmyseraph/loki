import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Table,
} from 'antd';
import moment from 'moment';
import React, { useState } from 'react';
import { ReportStatus, statusTag } from './interface.d';
import { history, Link } from 'umi';
import { api, ReportListReply, ReportListVariables } from '@/api/Api4Config';
import type { ColumnsType } from 'antd/lib/table';
import { useLazyQuery } from '@apollo/client';
import ReportTable from './report_table';

interface SearchParam {
  name?: string;
  creator?: string;
  status?: string;
  createTimeStart?: string;
  createTimeEnd?: string;
}

interface ReportData {
  id: string;
  name: string;
  status: number;
  creator: string;
  createTime: string;
}

const Report: React.FC<ReportData> = (props: any) => {
  const { query } = props.location;
  const [form] = Form.useForm();
  const RangePicker: any = DatePicker.RangePicker;

  const handleSearch = () => {
    let name: string = form.getFieldValue('name');
    let creator: string = form.getFieldValue('creator');
    let status: string = form.getFieldValue('status');
    let createTime: string[] = [];
    if (form.getFieldValue('createTime')) {
      createTime = [
        form.getFieldValue('createTime')[0].format('YYYY-MM-DD HH:mm:00'),
        form.getFieldValue('createTime')[1].format('YYYY-MM-DD HH:mm:00'),
      ];
    }
    let payload: SearchParam = {
      name,
      creator,
      status: status === 'all' ? undefined : status,
      createTimeStart: createTime.length === 2 ? createTime[0] : undefined,
      createTimeEnd: createTime.length === 2 ? createTime[1] : undefined,
    };
    history.push({ pathname: '/report', query: { ...payload } });
  };

  const handleSubmit = () => {
    form.submit();
  };

  const handleReset = () => {
    form.setFieldsValue({
      name: undefined,
      status: 'all',
      creator: undefined,
      createTime: undefined,
    });
  };

  return (
    <div>
      <Form
        form={form}
        name="report_search_form"
        autoComplete="off"
        onFinish={handleSearch}
      >
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item
              name="name"
              label="Report Name"
              initialValue={query?.name}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="creator"
              label="Creator"
              initialValue={query?.creator}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              name="status"
              label="Status"
              initialValue={
                query && query.status && query.status !== ''
                  ? query.status
                  : 'all'
              }
            >
              <Select>
                <Select.Option value="all">All</Select.Option>
                <Select.Option value={ReportStatus.FINISHED}>
                  Finished
                </Select.Option>
                <Select.Option value={ReportStatus.RUNNING}>
                  Running
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col>
            <Form.Item
              name="createTime"
              label="Create Time"
              initialValue={
                query && query.createTimeStart && query.createTimeEnd
                  ? [
                      moment(query?.createTimeStart),
                      moment(query?.createTimeEnd),
                    ]
                  : ''
              }
            >
              <RangePicker
                ranges={{
                  Today: [
                    moment(moment().format('YYYY-MM-DD 00:00')),
                    moment(moment().format('YYYY-MM-DD 23:59')),
                  ],
                }}
                showTime={{ format: 'HH:mm:00' }}
                // format="YYYY-MM-DD HH:mm"
              />
            </Form.Item>
          </Col>
          <Col>
            <Space size="middle">
              <Button type="primary" onClick={handleSubmit}>
                Search
              </Button>
              <Button onClick={handleReset}>Reset</Button>
            </Space>
          </Col>
        </Row>
      </Form>

      <ReportTable
        payload={{
          name: query?.name,
          creator: query?.creator,
          status:
            query && query.status && query.status !== ''
              ? query.status
              : undefined,
          createTimeStart: query?.createTimeStart,
          createTimeEnd: query?.createTimeEnd,
        }}
      />
    </div>
  );
};

export default Report;
