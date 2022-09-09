import React, { useState } from 'react';
import { Link } from 'umi';
import { Button, Col, DatePicker, Form, Input, Row, Space } from 'antd';
import moment from 'moment';
import { history } from 'umi';
import ScriptTable from './script_table';

interface SearchParam {
  name?: string;
  creator?: string;
  updateTimeStart?: string;
  updateTimeEnd?: string;
}

const Script: React.FC = (props: any) => {
  const { query } = props.location;
  const [_searchParam, setSearchParam] = useState<SearchParam>({
    name: query?.name,
    creator: query?.creator,
    updateTimeStart: query?.updateTimeStart,
    updateTimeEnd: query?.updateTimeEnd,
  });

  const [form] = Form.useForm();

  const RangePicker: any = DatePicker.RangePicker;

  const handleSearch = () => {
    let name: string = form.getFieldValue('name');
    let creator: string = form.getFieldValue('creator');
    let updateTime: string[] = [];
    if (form.getFieldValue('updateTime')) {
      updateTime = [
        form.getFieldValue('updateTime')[0].format('YYYY-MM-DD HH:mm:00'),
        form.getFieldValue('updateTime')[1].format('YYYY-MM-DD HH:mm:00'),
      ];
    }
    let payload: SearchParam = {
      name,
      creator,
      updateTimeStart: updateTime.length === 2 ? updateTime[0] : undefined,
      updateTimeEnd: updateTime.length === 2 ? updateTime[1] : undefined,
    };
    history.push({ pathname: '/script', query: { ...payload } });
    setSearchParam(payload);
  };

  const handleSubmit = () => {
    form.submit();
  };

  const handleReset = () => {
    form.setFieldsValue({
      name: undefined,
      creator: undefined,
      createTime: undefined,
    });
  };

  return (
    <div>
      {/* {console.log(query)} */}
      <Form
        form={form}
        name="script_search_form"
        autoComplete="off"
        onFinish={handleSearch}
      >
        <Row gutter={16}>
          <Col>
            <Form.Item
              name="name"
              label="Script Name"
              initialValue={query?.name}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              name="creator"
              label="Creator"
              initialValue={query?.creator}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              name="updateTime"
              label="Update Time"
              initialValue={
                query && query.updateTimeStart && query.updateTimeEnd
                  ? [
                      moment(query?.updateTimeStart),
                      moment(query?.updateTimeEnd),
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
      <Row style={{ marginTop: '20px' }}>
        <Button type="primary">
          <Link to={'/script/new'}>New Script</Link>
        </Button>
      </Row>
      <ScriptTable
        scriptListVariables={{
          name: query?.name,
          creator: query?.creator,
          updateTimeStart: query?.updateTimeStart,
          updateTimeEnd: query?.updateTimeEnd,
        }}
      />
    </div>
  );
};

export default Script;
