import mockjs from 'mockjs';
import Mock from 'mockjs';
import { api } from '@/api/ApiConfig';

const script_list: any[] = [];
for (let i = 0; i < 21; i++) {
  script_list.push({
    id: `${i}`,
    name: `script-${i}`,
    creator: 'liudao',
    createTime: '2021-3-12 15:00:00',
    updateTime: '2021-3-15 15:00:00',
  });
}

const report_list: any[] = [];
for (let i = 0; i < 21; i++) {
  report_list.push({
    id: `${i}`,
    name: `report-${i}`,
    status: '@integer(0,1)',
    creator: 'liudao',
    createTime: '2021-3-12 15:00:00',
    updateTime: '2021-3-15 15:00:00',
  });
}

const agent_list: any[] = [];
for (let i = 0; i < 21; i++) {
  agent_list.push({
    id: `${i}`,
    label: `agent-${i}`,
    host: '@ip',
    port: 6001,
    volume: 2000,
    status: '@integer(0,1)',
  });
}

const response_times_over_time_list: any[] = [];
for (let i = 0; i < 35; i++) {
  let minites = (i + '').length === 1 ? '0' + i : '' + i;
  response_times_over_time_list.push({
    label: 'sampler-1',
    response_times: '@integer(200, 700)',
    time: `2022-06-24 18:${minites}:00`,
  });
  response_times_over_time_list.push({
    label: 'sampler-2',
    response_times: '@integer(200, 700)',
    time: `2022-06-24 18:${minites}:00`,
  });
}

const active_threads_over_time_list: any[] = [];
for (let i = 0; i < 35; i++) {
  let minites = (i + '').length === 1 ? '0' + i : '' + i;
  active_threads_over_time_list.push({
    active_threads: 10 + 10 * i,
    time: `2022-06-24 18:${minites}:00`,
  });
}

const bytes_throughput_over_time_list: any[] = [];
for (let i = 0; i < 35; i++) {
  let minites = (i + '').length === 1 ? '0' + i : '' + i;
  bytes_throughput_over_time_list.push({
    bytes: '@integer(300,500)',
    time: `2022-06-24 18:${minites}:00`,
  });
}

const transactions_per_second_list: any[] = [];
for (let i = 0; i < 35; i++) {
  let minites = (i + '').length === 1 ? '0' + i : '' + i;
  transactions_per_second_list.push({
    label: 'sampler-1',
    transactions: '@integer(20,40)',
    time: `2022-06-24 18:${minites}:00`,
  });
  transactions_per_second_list.push({
    label: 'sampler-2',
    transactions: '@integer(20,40)',
    time: `2022-06-24 18:${minites}:00`,
  });
}

export default {
  'POST /api/user/login': mockjs.mock({
    code: 1000,
    message: 'success',
    data: {
      id: '1',
      name: 'louis',
      email: 'liudao@163.com',
      mobile: '13512341234',
      token: '123456789',
    },
  }),

  'GET /api/user/logout': mockjs.mock({
    code: 1000,
    message: 'success',
  }),

  'GET /api/script/list': mockjs.mock({
    code: 1000,
    message: 'success',
    data: script_list,
  }),

  'GET /api/script/detail': mockjs.mock({
    code: 1000,
    message: 'success',
    data: {
      id: '1',
      name: 'demo plan',
      script: `<?xml version="1.0" encoding="UTF-8"?>

            <TestPlan label="demo test" enabled="true" id="test_plan_1">
                    <Component category="Sampler" type="HelloSampler" label="hello" enabled="false" id="hello_sampler_1">
                        <Param name="name" type="string">liudao</Param>
                        <Param name="sleep" type="int">500</Param>
                    </Component>
                    <Component category="Sampler" type="HTTPSampler" label="sayhi request" enabled="true" id="http_sampler_1">
                        <Param name="protocol" type="string">HTTP</Param>
                        <Param name="domain" type="string">127.0.0.1</Param>
                        <Param name="path" type="string">/sayhi</Param>
                        <Param name="port" type="int">8088</Param>
                        <Param name="method" type="string">POST</Param>
                        <Param name="body" type="string"><![CDATA[{
    "name": "liudao",
    "age": 18
}]]></Param>
                    </Component>
            
            </TestPlan>`,
    },
  }),

  'POST /api/script/save': mockjs.mock({
    code: 1000,
    message: 'success',
  }),

  'GET /api/script/remove': mockjs.mock({
    code: 1000,
    message: 'success',
  }),

  'GET /api/report/list': mockjs.mock({
    code: 1000,
    message: 'success',
    data: report_list,
  }),

  'GET /api/report/info': mockjs.mock({
    code: 1000,
    message: 'success',
    data: {
      id: '1',
      name: 'demo pilot',
      script: '2',
      scriptName: 'script-2',
      duration: 300,
      status: 0,
      threads: 5000,
      startTime: '2022-06-23 15:00:00',
      endTime: '2022-06-23 15:05:00',
    },
  }),

  'GET /api/report/statistics': mockjs.mock({
    code: 1000,
    message: 'success',
    data: [
      {
        id: '1',
        label: 'Http Request-1',
        samplers: 2433,
        failures: 80,
        average: 567.47,
        min: 22,
        max: 6731,
        ninty: 677.91,
        ninty_five: 800.91,
        ninty_nine: 2013.87,
        tps: 28.1,
        recieved: 0.71,
        sent: 0.21,
        errors: [
          {
            type: '504/Gateway Timeout',
            num: 23,
          },
          {
            type: '502/Bad Gateway',
            num: 57,
          },
        ],
      },
      {
        id: '2',
        label: 'Http Request-2',
        samplers: 4300,
        failures: 90,
        average: 667.47,
        min: 28,
        max: 10731,
        ninty: 777.91,
        ninty_five: 900.91,
        ninty_nine: 8013.87,
        tps: 20.1,
        recieved: 1.71,
        sent: 0.51,
        errors: [
          {
            type: '504/Gateway Timeout',
            num: 90,
          },
        ],
      },
    ],
  }),

  'GET /api/agent/list': mockjs.mock({
    code: 1000,
    message: 'success',
    data: agent_list,
  }),

  'POST /api/pilot/start': mockjs.mock({
    code: 1000,
    message: 'success',
    data: {
      id: 1,
    },
  }),

  'GET /api/report/charts': mockjs.mock({
    code: 1000,
    message: 'success',
    data: {
      response_times_over_time: response_times_over_time_list,
      active_threads_over_time: active_threads_over_time_list,
      bytes_throughput_over_time: bytes_throughput_over_time_list,
      transactions_per_second: transactions_per_second_list,
    },
  }),
};
