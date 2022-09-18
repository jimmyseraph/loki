import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Slider,
  Space,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { ScriptData } from '@/pages/script/script_table';
import DebounceSelect from '@/components/debounceSelect';
import {
  api,
  StartPilotReply,
  StartPilotVariables,
  ScriptListVariables,
  ScriptListReply,
} from '@/api/Api4Config';
import type { AgentData } from '@/pages/interface.d';
import { useLazyQuery } from '@apollo/client';
import AgentListModal from './agent_modal';

interface ScriptValue {
  label: string;
  value: string;
}

const Pilot: React.FC = (props: any) => {
  const [form] = Form.useForm();
  const [selectedAgent, setSelectedAgent] = useState<AgentData[]>([]);
  const [loadData, setLoadData] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);

  const { pathname, query } = props.location;

  const [, { loading: loadingScriptList, refetch: getScriptList }] =
    useLazyQuery<{ ScriptList: ScriptListReply[] }, ScriptListVariables>(
      api.getScriptList,
    );
  const [, { loading: _loading, refetch: startPilot }] = useLazyQuery<
    { StartPilot: StartPilotReply },
    { startPilotRequest: StartPilotVariables }
  >(api.startPilot);

  useEffect(() => {
    if (query && query.script) {
      getScriptList({ id: query.script })
        .then((res) => {
          if (res.errors && res.errors.length > 0) {
            message.error(res.errors[0].message);
            if (res.errors[0].message === 'auth failed') {
              history.push('/login');
            }
            return;
          }
          if (res.data && res.data.ScriptList.length > 0) {
            let data = res.data.ScriptList[0];
            form.setFieldsValue({
              name: data.name,
              script: { label: data.name, value: data.id },
              duration: 0,
            });
          }
        })
        .catch((err) => {
          message.error(err.message);
        });
    }
  }, [loadData]);

  const handleScriptChange = (value: any) => {
    history.push({ pathname: '/pilot', query: { script: value?.value } });
    form.setFieldsValue({
      name: value?.label,
    });
  };

  const handleFinish = () => {
    if (!selectedAgent || selectedAgent.length === 0) {
      message.error('None Agent Selected');
      return;
    }
    let name = form.getFieldValue('name');
    let script = form.getFieldValue('script')?.value;
    let duration = form.getFieldValue('duration') as number;
    let agents = form.getFieldValue('agents');
    let payload = {
      name,
      script,
      duration,
      agents,
    };
    startPilot({ startPilotRequest: { ...payload } })
      .then((res) => {
        console.log(res);
        if (res.errors) {
          message.error(res.errors[0].message);
          if (res.errors[0].message === 'auth failed') {
            history.push('/login');
          }
        }
        if (res.data && res.data.StartPilot && res.data.StartPilot.id) {
          message.success('Start Pilot Success');
          history.push({
            pathname: '/report/detail',
            query: { id: res.data.StartPilot.id },
          });
        }
      })
      .catch((err) => {
        message.error(err.message);
      });
  };

  const handleSubmit = () => {
    form.submit();
  };

  const handleReset = () => {
    history.push({ pathname: '/pilot' });
    setSelectedAgent([]);
    form.resetFields();
  };

  const handShowModal = () => {
    // getAgentData();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChangeSelect = (selectedAgent: AgentData[]) => {
    // setSelectedAgent(selectedAgent);
  };

  const handleSelect = (
    record: AgentData,
    selected: boolean,
    add: (defauleValue: { id: string; name: string; threads: number }) => void,
    remove: (id: number) => void,
  ) => {
    if (selected) {
      setSelectedAgent((origin) => {
        origin.push(record);
        return origin;
      });
      add({
        id: record.id,
        name: record.label,
        threads: 1,
      });
    } else {
      let agents = form.getFieldValue('agents');
      for (let i = 0; i < selectedAgent.length; i++) {
        if (record.id === selectedAgent[i].id) {
          setSelectedAgent((origin) => {
            origin.splice(i, 1);
            return origin;
          });
        }
      }
      if (agents && agents.length > 0) {
        for (let i = 0; i < agents.length; i++) {
          if (agents[i].id === record.id) {
            remove(i);
          }
        }
      }
    }
  };

  async function fetchList<T>(
    keyword: string,
    callback: (res: any) => T,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      getScriptList({ name: keyword })
        .then((res) => {
          if (res.errors && res.errors.length > 0) {
            message.error(res.errors[0].message);
            if (res.errors[0].message === 'auth failed') {
              history.push('/login');
            }
            return;
          } else {
            let d = callback(res);
            resolve(d);
          }
        })
        .catch((err) => {
          message.error(err.message);
        });
    });
  }

  return (
    <div>
      <Form
        form={form}
        name="pilot_form"
        autoComplete="off"
        onFinish={handleFinish}
      >
        <Row gutter={16}>
          <Col>
            <Space size={'large'}>
              <Button type="primary" onClick={handleSubmit}>
                Start
              </Button>
              <Button onClick={handleReset}>Reset</Button>
            </Space>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: '20px' }}>
          <Col>
            <Form.Item
              name={'name'}
              label="Pilot Name"
              rules={[{ required: true, message: 'Missing Label' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name={'script'}
              label="Script"
              // initialValue={{ label: pilotData?.scriptName, value: pilotData?.script }}
              rules={[{ required: true, message: 'Missing Script' }]}
            >
              <DebounceSelect
                placeholder="Select script"
                onChange={(value, _) => handleScriptChange(value)}
                showSearch
                fetchOptions={(keyword) =>
                  fetchList<ScriptValue[]>(keyword, (res) =>
                    res.data.ScriptList.map((item: ScriptData) => ({
                      label: item.name,
                      value: item.id,
                    })),
                  )
                }
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              name={'duration'}
              label="Duration(seconds)"
              // initialValue={pilotData?.duration}
              rules={[
                { required: true, message: 'Need valid number' },
                { min: 1, message: 'Cannot less than 1', type: 'number' },
              ]}
            >
              <InputNumber min={1} />
            </Form.Item>
          </Col>
        </Row>
        <Divider orientation="left" plain>
          Agent Setting
        </Divider>
        <Row>
          <Form.List name={'agents'}>
            {(fields, { add, remove }) => {
              return (
                <>
                  {fields.map(({ key, name, ...restField }) => {
                    return (
                      <Space
                        key={key}
                        align="baseline"
                        style={{ width: '100%' }}
                      >
                        <Form.Item
                          {...restField}
                          label="Agent ID"
                          name={[name, 'id']}
                        >
                          <Input disabled bordered={false} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          label="Agent Name"
                          name={[name, 'name']}
                        >
                          <Input disabled bordered={false} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          label={`Number of Threads(Max:${selectedAgent[name]?.volume})`}
                          style={{ width: '400px' }}
                        >
                          <Row>
                            <Col span={12}>
                              <Form.Item name={[name, 'threads']}>
                                <Slider
                                  min={1}
                                  max={selectedAgent[name]?.volume}
                                />
                              </Form.Item>
                            </Col>
                            <Col>
                              <Form.Item name={[name, 'threads']}>
                                <InputNumber
                                  min={1}
                                  max={selectedAgent[name]?.volume}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form.Item>
                        <MinusCircleOutlined
                          onClick={() => {
                            remove(name);
                            setSelectedAgent((origin) => {
                              origin.splice(name, 1);
                              return origin;
                            });
                          }}
                        />
                      </Space>
                    );
                  })}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => handShowModal()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add/Remove Agent
                    </Button>
                  </Form.Item>
                  <AgentListModal
                    title="Agent List"
                    visible={showModal}
                    onCancel={handleCloseModal}
                    selectedAgent={selectedAgent}
                    onChange={handleChangeSelect}
                    onSelect={(record, selected) =>
                      handleSelect(record, selected, add, remove)
                    }
                  />
                </>
              );
            }}
          </Form.List>
        </Row>
      </Form>
    </div>
  );
};

export default Pilot;
